import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { sumBy } from 'lodash'
import moment from 'moment'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeRefinanceAction } from '@banx/transactions/loans'
import { enqueueSnackbar } from '@banx/utils'

import { useAuctionsLoans } from '../../hooks'

import styles from './RefinanceTable.module.less'

interface SummaryProps {
  selectedLoans: Loan[]
  onSelectAllLoans: () => void
  onDeselectAllLoans: () => void
}

export const Summary: FC<SummaryProps> = ({
  selectedLoans,
  onSelectAllLoans,
  onDeselectAllLoans,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { addMints } = useAuctionsLoans()

  const selectAllBtnText = !selectedLoans.length ? 'Select all' : 'Deselect all'
  const selectMobileBtnText = !selectedLoans.length
    ? `Select all`
    : `Deselect ${selectedLoans.length}`

  const totalFloor = sumBy(selectedLoans, ({ nft }) => nft.collectionFloor)
  const totalDebt = sumBy(selectedLoans, (loan) => calcLoanDebt(loan))

  const refinanceAll = () => {
    const txnParams = selectedLoans.map((loan) => ({ loan }))

    new TxnExecutor(makeRefinanceAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]

        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        onDeselectAllLoans()
        addMints(...selectedLoans.map(({ nft }) => nft.mint))
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, txnParams)
      })
      .execute()
  }

  const onSelectAllBtnClick = () => {
    !selectedLoans.length ? onSelectAllLoans() : onDeselectAllLoans()
  }

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{selectedLoans.length}</p>
        <p className={styles.collateralsSubtitle}>Loans selected</p>
      </div>
      <div className={styles.statsContainer}>
        <div className={styles.stats}>
          <p>Total floor</p>
          <p>{createSolValueJSX(totalFloor, 1e9, '0◎')}</p>
        </div>
        <div className={styles.stats}>
          <p>Total debt</p>
          <p>{createSolValueJSX(totalDebt, 1e9, '0◎')}</p>
        </div>
        {/* //TODO Calc weighted apy  */}
        {/* <div className={styles.stats}>
          <p>Weighted apy</p>
          <p>{createPercentValueJSX(100)}</p>
        </div> */}
      </div>
      <div className={styles.summaryBtns}>
        <Button variant="secondary" onClick={onSelectAllBtnClick}>
          <span className={styles.selectButtonText}>{selectAllBtnText}</span>
          <span className={styles.selectButtonMobileText}>{selectMobileBtnText}</span>
        </Button>
        <Button onClick={refinanceAll} disabled={!selectedLoans.length}>
          Refinance {createSolValueJSX(totalDebt, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}

export const calcLoanDebt = (loan: Loan) => {
  const { solAmount, soldAt, feeAmount, amountOfBonds } = loan.bondTradeTransaction || {}

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue: solAmount + feeAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  })

  return solAmount + calculatedInterest + feeAmount
}
