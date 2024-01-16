import { FC, useMemo } from 'react'

import { Loan } from '@banx/api/core'
import { isLoanAbleToClaim } from '@banx/pages/OffersPage'
import { isUnderWaterLoan } from '@banx/utils'

import { ClaimContent, TerminateContent } from './components'

import styles from './Summary.module.less'

interface SummaryProps {
  updateOrAddLoan: (loan: Loan) => void
  hideLoans: (...mints: string[]) => void
  isUnderwaterFilterActive: boolean

  selectedLoans: Loan[]
  setSelection: (loans: Loan[]) => void

  loans: Loan[]
}

export const Summary: FC<SummaryProps> = ({
  updateOrAddLoan,
  loans,
  hideLoans,
  isUnderwaterFilterActive,
  selectedLoans,
  setSelection,
}) => {
  const loansToClaim = useMemo(() => loans.filter(isLoanAbleToClaim), [loans])
  const loansToTerminate = useMemo(() => loans.filter(isUnderWaterLoan), [loans])

  return (
    <div className={styles.summaryContainer}>
      {isUnderwaterFilterActive ? (
        <TerminateContent
          loans={loansToTerminate}
          selectedLoans={selectedLoans}
          setSelection={setSelection}
          updateOrAddLoan={updateOrAddLoan}
        />
      ) : (
        <ClaimContent loans={loansToClaim} hideLoans={hideLoans} />
      )}
    </div>
  )
}
