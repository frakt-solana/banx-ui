import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { sumBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimAction, makeTerminateAction } from '@banx/transactions/loans'
import { HealthColorIncreasing, enqueueSnackbar, getColorByPercent } from '@banx/utils'

import { getTerminateStatsInfo } from './helpers'

import styles from './Summary.module.less'

interface SummaryProps {
  loansToClaim: Loan[]
  loansToTerminate: Loan[]
  updateOrAddLoan: (loan: Loan) => void
  hideLoans: (...mints: string[]) => void
  selectedLoans: Loan[]
  setSelection: (loans: Loan[]) => void
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
  const { connection } = useConnection()

  const { totalLent, averageLtv, totalInterest } = getTerminateStatsInfo(selectedLoans)

  const terminateLoans = () => {
    const txnParams = selectedLoans.map((loan) => ({ loan }))

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
          transactionName: 'TerminateLoans',
        })
      })
      .execute()
  }

  const totalClaimableFloor = useMemo(
    () => sumBy(loansToClaim, ({ nft }) => nft.collectionFloor),
    [loansToClaim],
  )

  const claimLoans = () => {
    const txnParams = loansToClaim.map((loan) => ({ loan }))

    new TxnExecutor(makeClaimAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        enqueueSnackbar({
          message: 'Collateral successfully claimed',
          type: 'success',
          solanaExplorerPath: `tx/${results[0].txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        hideLoans(...loansToClaim.map(({ nft }) => nft.mint))
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'ClaimLoans',
        })
      })
      .execute()
  }

  const handleLoanSelection = (value = 0) => {
    setSelection(loansToTerminate.slice(0, value))
  }

  return (
    <div className={styles.container}>
      {!!loansToClaim.length && (
        <Button className={styles.claimButton} onClick={claimLoans} type="circle" variant="text">
          Claimable floor {createSolValueJSX(totalClaimableFloor, 1e9, '0◎')}
        </Button>
      )}

      <div className={styles.content}>
        <div className={styles.mainStat}>
          <p>{createSolValueJSX(totalLent, 1e9, '0◎')}</p>
          <p>Lent amount</p>
        </div>

        <div className={styles.additionalStats}>
          <StatInfo
            label="Avg ltv"
            value={averageLtv}
            valueType={VALUES_TYPES.PERCENT}
            valueStyles={{
              color: averageLtv ? getColorByPercent(averageLtv, HealthColorIncreasing) : '',
            }}
          />
          <StatInfo label="interest" value={totalInterest} divider={1e9} />
        </div>

        <div className={styles.terminateControls}>
          <CounterSlider
            label="# Loans"
            value={selectedLoans.length}
            onChange={(value) => handleLoanSelection(value)}
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
