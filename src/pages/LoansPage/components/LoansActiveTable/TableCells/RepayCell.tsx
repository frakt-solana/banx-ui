import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'

import { useLoansTransactions } from '../../LoansActiveTab/hooks'

interface RepayCellProps {
  loan: Loan
  isCardView: boolean
}

export const RepayCell: FC<RepayCellProps> = ({ loan, isCardView }) => {
  const { repayLoan } = useLoansTransactions()

  return (
    <Button
      size={isCardView ? 'large' : 'small'}
      onClick={(event) => {
        repayLoan(loan)
        event.stopPropagation()
      }}
    >
      Repay
    </Button>
  )
}
