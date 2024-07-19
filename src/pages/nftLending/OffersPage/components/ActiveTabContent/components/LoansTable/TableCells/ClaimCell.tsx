import { FC } from 'react'

import { BN } from 'fbonds-core'
import { calculateCurrentInterestSolPureBN } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { DisplayValue, HorizontalCell } from '@banx/components/TableComponents'

import { coreNew } from '@banx/api/nft'
import { calculateLentValue } from '@banx/pages/nftLending/OffersPage'
import { calculateBorrowedAmount, calculateClaimValue } from '@banx/utils'

import styles from '../LoansTable.module.less'

interface ClaimCellProps {
  loan: coreNew.Loan
}

export const ClaimCell: FC<ClaimCellProps> = ({ loan }) => {
  const { amountOfBonds, soldAt } = loan.bondTradeTransaction

  const loanBorrowedAmount = calculateBorrowedAmount(loan)

  const interestParameters = {
    loanValue: loanBorrowedAmount,
    startTime: soldAt,
    currentTime: new BN(moment().unix()),
    rateBasePoints: amountOfBonds,
  }

  const currentInterest = calculateCurrentInterestSolPureBN(interestParameters)
  const claimValue = calculateClaimValue(loan)
  const lentValue = calculateLentValue(loan)

  const tooltopContent = (
    <div className={styles.tooltipContainer}>
      {createTooltipContent('Lent', lentValue.toNumber())}
      {createTooltipContent('Accrued interest', currentInterest.toNumber())}
    </div>
  )

  return (
    <HorizontalCell tooltipContent={tooltopContent} value={<DisplayValue value={claimValue} />} />
  )
}

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <span>{label}</span>
    <span>
      <DisplayValue value={value} />
    </span>
  </div>
)
