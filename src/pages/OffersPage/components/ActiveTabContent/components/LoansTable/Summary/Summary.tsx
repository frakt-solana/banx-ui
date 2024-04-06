import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useIsLedger, usePriorityFees } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimAction, makeTerminateAction } from '@banx/transactions/loans'
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
  loansToClaim: Loan[]
  loansToTerminate: Loan[]
  updateOrAddLoan: (loan: Loan) => void
  hideLoans: (...mints: string[]) => void
  selectedLoans: Loan[]
  setSelection: (loans: Loan[], walletPublicKey: string) => void
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
  const { priorityLevel } = usePriorityFees()
  const walletPublicKeyString = wallet.publicKey?.toBase58() || ''
  const { clear: clearSelection } = useSelectedLoans()

  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const { totalLent, averageLtv, totalInterest } = getTerminateStatsInfo(selectedLoans)

  const terminateLoans = () => {
    const loadingSnackbarId = uniqueId()

    const txnParams = selectedLoans.map((loan) => ({ loan, priorityFeeLevel: priorityLevel }))

    new TxnExecutor(
      makeTerminateAction,
      { wallet: createWalletInstance(wallet), connection },
      { signAllChunkSize: isLedger ? 5 : 40, confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS },
    )
      .addTransactionParams(txnParams)
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
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'TerminateLoans',
        })
      })
      .execute()
  }

  const claimLoans = () => {
    const loadingSnackbarId = uniqueId()

    const txnParams = loansToClaim.map((loan) => ({ loan, priorityFeeLevel: priorityLevel }))

    new TxnExecutor(
      makeClaimAction,
      { wallet: createWalletInstance(wallet), connection },
      { signAllChunkSize: isLedger ? 5 : 40, confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS },
    )
      .addTransactionParams(txnParams)
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
            .map(({ result }) => result?.nft.mint)
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
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'ClaimLoans',
        })
      })
      .execute()
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
