import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { Loan } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeTerminateAction } from '@banx/transactions/loans'
import { HealthColorIncreasing, enqueueSnackbar, getColorByPercent } from '@banx/utils'

import { getTerminateStatsInfo } from './helpers'

import styles from './Summary.module.less'

interface TerminateContentProps {
  loans: Loan[]
  selectedLoans: Loan[]
  setSelection: (loans: Loan[]) => void
  updateOrAddLoan: (loan: Loan) => void
}

export const TerminateContent: FC<TerminateContentProps> = ({
  loans,
  selectedLoans,
  setSelection,
  updateOrAddLoan,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const totalSelectedLoans = selectedLoans.length

  const { totalLent, averageLtv, totalInterest } = getTerminateStatsInfo(selectedLoans)

  const terminateLoans = () => {
    const txnParams = loans.map((loan) => ({ loan }))

    new TxnExecutor(makeTerminateAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ txnHash, result }) => {
          enqueueSnackbar({
            message: 'Collateral successfully terminated',
            type: 'success',
            solanaExplorerPath: `tx/${txnHash}`,
          })

          if (result) {
            updateOrAddLoan(result)
          }
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Terminate',
        })
      })
      .execute()
  }

  const handleLoanSelection = (value = 0) => {
    setSelection(loans.slice(0, value))
  }

  return (
    <div className={styles.content}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{totalSelectedLoans}</p>
        <p className={styles.collateralsSubtitle}>Loans selected</p>
      </div>

      <div className={styles.stats}>
        <StatInfo label="Lent" value={totalLent} divider={1e9} />
        <StatInfo
          label="Avg ltv"
          value={averageLtv}
          valueType={VALUES_TYPES.PERCENT}
          valueStyles={{ color: getColorByPercent(averageLtv, HealthColorIncreasing) }}
        />
        <StatInfo label="interest" value={totalInterest} divider={1e9} />
      </div>

      <div className={styles.sliderAndButtonWrapper}>
        <CounterSlider
          label="# Loans"
          value={totalSelectedLoans}
          onChange={(value) => handleLoanSelection(value)}
          className={styles.counterSlider}
          max={loans.length}
        />

        <Button
          className={classNames(styles.summaryButton, styles.terminateButton)}
          onClick={terminateLoans}
          disabled={!loans.length}
          variant="secondary"
        >
          Terminate
        </Button>
      </div>
    </div>
  )
}
