import { FC } from 'react'

import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

import { useSelectedLoans } from '../../loansState'
import { useLoansTransactions } from './hooks'

import styles from './LoansActiveTable.module.less'

interface SummaryProps {
  loans: Loan[]
}

export const Summary: FC<SummaryProps> = ({ loans }) => {
  const { selection, setSelection, clearSelection } = useSelectedLoans()

  const { repayBulkLoan } = useLoansTransactions()

  const totalLoans = selection.length
  const totalBorrowed = sumBy(selection, ({ fraktBond }) => fraktBond.borrowedAmount)
  const totalDebt = sumBy(selection, (loan) => calculateLoanRepayValue(loan))

  const selectAll = () => {
    if (!selection.length) {
      setSelection(loans)
    } else {
      clearSelection()
    }
  }

  const selectAllBtnText = !selection?.length ? 'Select all' : 'Deselect all'
  const selectMobileBtnText = !selection.length ? `Select all` : `Deselect ${selection.length}`

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{totalLoans}</p>
        <p className={styles.collateralsSubtitle}>Collaterals selected</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Borrowed" value={totalBorrowed} divider={1e9} />
        <StatInfo label="Debt" value={totalDebt} divider={1e9} />
      </div>
      <div className={styles.summaryBtns}>
        <Button variant="secondary" onClick={selectAll}>
          <span className={styles.selectButtonText}>{selectAllBtnText}</span>
          <span className={styles.selectButtonMobileText}>{selectMobileBtnText}</span>
        </Button>
        <Button onClick={repayBulkLoan} disabled={!selection.length}>
          Repay {createSolValueJSX(totalDebt, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}
