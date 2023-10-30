import { FC } from 'react'

import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calcLoanBorrowedAmount, calculateLoanRepayValue } from '@banx/utils'

import { useSelectedLoans } from '../../loansState'
import { useLoansTransactions } from './hooks'

import styles from './LoansActiveTable.module.less'

interface SummaryProps {
  loans: Loan[]
}

export const Summary: FC<SummaryProps> = ({ loans }) => {
  const { selection, setSelection } = useSelectedLoans()

  const { repayBulkLoan } = useLoansTransactions()

  const selectedLoans = selection.length

  const totalBorrowed = sumBy(selection, (loan) => calcLoanBorrowedAmount(loan))
  const totalDebt = sumBy(selection, (loan) => calculateLoanRepayValue(loan))

  const handleLoanSelection = (value = 0) => {
    setSelection(loans.slice(0, value))
  }

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{selectedLoans}</p>
        <p className={styles.collateralsSubtitle}>Nfts selected</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Borrowed" value={totalBorrowed} divider={1e9} />
        <StatInfo label="Debt" value={totalDebt} divider={1e9} />
      </div>
      <div className={styles.summaryBtns}>
        <CounterSlider
          value={selectedLoans}
          onChange={(value) => handleLoanSelection(value)}
          max={loans.length}
        />
        <Button onClick={repayBulkLoan} disabled={!selectedLoans}>
          Repay {createSolValueJSX(totalDebt, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}
