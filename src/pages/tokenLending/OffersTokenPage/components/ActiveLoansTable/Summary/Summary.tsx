import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain, reduce, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { useIsLedger } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  createClaimTokenTxnData,
  createTerminateTokenTxnData,
} from '@banx/transactions/tokenLending'
import {
  HealthColorIncreasing,
  calculateLentTokenValueWithInterest,
  calculateTokenLoanValueWithUpfrontFee,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getColorByPercent,
} from '@banx/utils'

import { useSelectedTokenLoans } from '../loansState'

import styles from './Summary.module.less'

interface SummaryProps {
  loansToClaim: core.TokenLoan[]
  loansToTerminate: core.TokenLoan[]
  updateOrAddLoan: (loan: core.TokenLoan) => void
  hideLoans: (mints: string[]) => void
  selectedLoans: core.TokenLoan[]
  setSelection: (loans: core.TokenLoan[], walletPublicKey: string) => void
}

const Summary: FC<SummaryProps> = ({
  loansToTerminate,
  loansToClaim,
  updateOrAddLoan,
  hideLoans,
  selectedLoans,
  setSelection,
}) => {
  const wallet = useWallet()
  const walletPublicKeyString = wallet.publicKey?.toBase58() || ''
  const { clear: clearSelection } = useSelectedTokenLoans()

  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const { totalLent, averageLtv, totalInterest } = getTerminateStatsInfo(selectedLoans)

  const terminateLoans = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selectedLoans.map((loan) => createTerminateTokenTxnData({ loan, walletAndConnection })),
      )

      await new TxnExecutor<core.TokenLoan>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 5 : 40,
      })
        .addTxnsData(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Collaterals successfully terminated', type: 'success' })
            confirmed.forEach(({ result }) => result && updateOrAddLoan(result))
            clearSelection()
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: selectedLoans,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'TerminateTokenLoans',
      })
    }
  }

  const claimLoans = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        loansToClaim.map((loan) => createClaimTokenTxnData({ loan, walletAndConnection })),
      )

      await new TxnExecutor<core.TokenLoan>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 5 : 40,
      })
        .addTxnsData(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Collaterals successfully claimed', type: 'success' })

            const mintsToHidden = chain(confirmed)
              .map(({ result }) => result?.collateral.mint)
              .compact()
              .value()

            hideLoans(mintsToHidden)
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loansToClaim,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ClaimTokenLoans',
      })
    }
  }

  const handleLoanSelection = (value = 0) => {
    setSelection(loansToTerminate.slice(0, value), walletPublicKeyString)
  }

  return (
    <div className={styles.container}>
      {!!loansToClaim.length && (
        <Button className={styles.claimButton} onClick={claimLoans} type="circle" variant="text">
          Claim defaults
        </Button>
      )}

      <div className={styles.content}>
        <div className={styles.mainStat}>
          <p>
            <DisplayValue value={totalLent} />
          </p>
          <p>Lent amount</p>
        </div>

        <div className={styles.additionalStats}>
          <StatInfo
            classNamesProps={{ container: styles.lentAmountStat }}
            label="Lent amount"
            value={<DisplayValue value={totalLent} />}
          />
          <StatInfo
            label="Avg ltv"
            value={averageLtv}
            valueType={VALUES_TYPES.PERCENT}
            valueStyles={{
              color: averageLtv ? getColorByPercent(averageLtv, HealthColorIncreasing) : '',
            }}
          />
          <StatInfo label="interest" value={<DisplayValue value={totalInterest} />} />
        </div>

        <div className={styles.terminateControls}>
          <CounterSlider
            label="# Loans"
            value={selectedLoans.length}
            onChange={(value) => handleLoanSelection(value)}
            disabled={!loansToTerminate.length}
            className={styles.terminateSliderWrapper}
            max={loansToTerminate.length}
          />
          <Button
            className={classNames(styles.summaryButton, styles.terminateButton)}
            onClick={terminateLoans}
            disabled={!selectedLoans.length}
            variant="secondary"
          >
            Terminate
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Summary

const getTerminateStatsInfo = (loans: core.TokenLoan[]) => {
  return reduce(
    loans,
    (acc, loan) => {
      const claimValue = calculateLentTokenValueWithInterest(loan).toNumber()
      const borrowedAmount = calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
      const collectionFloor = loan.collateralPrice

      return {
        totalLent: acc.totalLent + borrowedAmount,
        averageLtv: acc.averageLtv + (claimValue / collectionFloor / loans.length) * 100,
        totalInterest: acc.totalInterest + claimValue - borrowedAmount,
      }
    },
    { totalLent: 0, averageLtv: 0, totalInterest: 0 },
  )
}
