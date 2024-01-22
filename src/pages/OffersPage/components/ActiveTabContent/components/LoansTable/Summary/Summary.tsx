import { FC } from 'react'

import { Loan } from '@banx/api/core'

import { ClaimContent, TerminateContent } from './components'

import styles from './Summary.module.less'

interface SummaryProps {
  updateOrAddLoan: (loan: Loan) => void
  hideLoans: (...mints: string[]) => void
  isUnderwaterFilterActive: boolean

  selectedLoans: Loan[]
  setSelection: (loans: Loan[]) => void

  loansToClaim: Loan[]
  underwaterLoans: Loan[]
}

export const Summary: FC<SummaryProps> = ({
  updateOrAddLoan,
  loansToClaim,
  underwaterLoans,
  hideLoans,
  isUnderwaterFilterActive,
  selectedLoans,
  setSelection,
}) => {
  return (
    <div className={styles.summaryContainer}>
      {isUnderwaterFilterActive ? (
        <TerminateContent
          loans={underwaterLoans}
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
