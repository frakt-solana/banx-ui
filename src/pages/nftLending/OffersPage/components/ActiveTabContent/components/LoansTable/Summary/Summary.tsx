import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain, uniqueId } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { TxnExecutor } from 'solana-transactions-executor'
import { core } from '@banx/api/nft'
import { useIsLedger } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateClaimTxnDataParams,
  CreateTerminateTxnDataParams,
  createClaimTxnData,
  createTerminateTxnData,
  parseTerminateSimulatedAccounts,
} from '@banx/transactions/nftLending'
import {
  HealthColorIncreasing,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getColorByPercent,
} from '@banx/utils'

import { useSelectedLoans } from '../loansState'
import { getTerminateStatsInfo } from './helpers'

import styles from './Summary.module.less'

interface SummaryProps {
  loansToClaim: core.Loan[]
  loansToTerminate: core.Loan[]
  updateOrAddLoan: (loan: core.Loan) => void
  hideLoans: (...mints: string[]) => void
  selectedLoans: core.Loan[]
  setSelection: (loans: core.Loan[], walletPublicKey: string) => void
}

export const Summary: FC<SummaryProps> = ({
  loansToTerminate,
  loansToClaim,
  updateOrAddLoan,
  hideLoans,
  selectedLoans,
  setSelection,
}) => {
  const wallet = useWallet()
  const walletPublicKeyString = wallet.publicKey?.toBase58() || ''
  const { clear: clearSelection } = useSelectedLoans()

  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const { totalLent, averageLtv, totalInterest } = getTerminateStatsInfo(selectedLoans)

  const terminateLoans = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selectedLoans.map((loan) => createTerminateTxnData({ loan }, walletAndConnection)),
      )

      await new TxnExecutor<CreateTerminateTxnDataParams>(walletAndConnection, {
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
            confirmed.forEach(({ accountInfoByPubkey, params }) => {
              if (!accountInfoByPubkey) return

              const { loan } = params
              const { bondTradeTransaction, fraktBond } =
                parseTerminateSimulatedAccounts(accountInfoByPubkey)

              updateOrAddLoan({ ...loan, fraktBond, bondTradeTransaction })
            })
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
        transactionName: 'TerminateLoans',
      })
    }
  }

  const claimLoans = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        loansToClaim.map((loan) => createClaimTxnData({ loan }, walletAndConnection)),
      )

      await new TxnExecutor<CreateClaimTxnDataParams>(walletAndConnection, {
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
              .map(({ params }) => params.loan.nft.mint)
              .compact()
              .value()

            hideLoans(...mintsToHidden)
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
        transactionName: 'ClaimLoans',
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
