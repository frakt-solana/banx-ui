import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calcWeeklyFeeWithRepayFee, calculateLoanRepayValue, formatDecimal } from '@banx/utils'

import { LoanOptimistic } from '../../loansState'
import { caclFractionToRepay, calcUnpaidAccruedInterest } from './helpers'
import { useLoansTransactions } from './hooks'

import styles from './LoansActiveTable.module.less'

interface SummaryProps {
  loans: Loan[]
  selectedLoans: LoanOptimistic[]
  setSelection: (loans: Loan[], walletPublicKey: string) => void
}

export const Summary: FC<SummaryProps> = ({ loans, selectedLoans, setSelection }) => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { repayBulkLoan, repayUnpaidLoansInterest } = useLoansTransactions()

  const totalSelectedLoans = selectedLoans.length

  const totalDebt = sumBy(selectedLoans, ({ loan }) => calculateLoanRepayValue(loan))
  const totalWeeklyFee = sumBy(selectedLoans, ({ loan }) => calcWeeklyFeeWithRepayFee(loan))
  const totalUnpaidAccruedInterest = sumBy(selectedLoans, ({ loan }) =>
    calcUnpaidAccruedInterest(loan),
  )

  const totalBorrowed = sumBy(selectedLoans, ({ loan }) => {
    const { fraktBond, totalRepaidAmount = 0 } = loan
    return fraktBond.borrowedAmount - totalRepaidAmount
  })

  const loansWithCalculatedUnpaidInterest = useMemo(() => {
    return selectedLoans
      .map(({ loan }) => ({ loan, fractionToRepay: caclFractionToRepay(loan) }))
      .filter(({ fractionToRepay }) => fractionToRepay > 0)
  }, [selectedLoans])

  const handleLoanSelection = (value = 0) => {
    setSelection(loans.slice(0, value), walletPublicKeyString)
  }

  return (
    <div className={styles.summary}>
      <div className={styles.mainStat}>
        <p>{totalSelectedLoans}</p>
        <p>Nfts selected</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Principal" value={totalBorrowed} divider={1e9} />
        <StatInfo label="Weekly fee" value={totalWeeklyFee} divider={1e9} />
      </div>
      <div className={styles.summaryControls}>
        <CounterSlider
          label="# Loans"
          value={totalSelectedLoans}
          onChange={(value) => handleLoanSelection(value)}
          rootClassName={styles.slider}
          className={styles.sliderContainer}
          max={loans.length}
        />
        <Button
          onClick={() => repayUnpaidLoansInterest(loansWithCalculatedUnpaidInterest)}
          disabled={!totalUnpaidAccruedInterest}
        >
          Pay fee {createSolValueJSX(totalUnpaidAccruedInterest, 1e9, '0◎', formatDecimal)}
        </Button>
        <Button onClick={repayBulkLoan} disabled={!totalSelectedLoans}>
          Repay {createSolValueJSX(totalDebt, 1e9, '0◎', formatDecimal)}
        </Button>
      </div>
    </div>
  )
}
