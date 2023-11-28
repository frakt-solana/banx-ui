import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from '../ActiveOffersTable.module.less'

interface InterestCellProps {
  loan: Loan
  isCardView: boolean
}

export const InterestCell: FC<InterestCellProps> = ({ loan, isCardView }) => {
  const { solAmount, feeAmount, amountOfBonds, soldAt } = loan.bondTradeTransaction || {}

  const totalLoanValue = solAmount + feeAmount
  const collectionFloor = loan.nft.collectionFloor

  const interestParameters = {
    loanValue: totalLoanValue,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  }

  const currentInterest = calculateCurrentInterestSolPure(interestParameters)
  const totalClaimValue = currentInterest + totalLoanValue

  const formattedClaimValue = createSolValueJSX(totalClaimValue, 1e9, '--', formatDecimal)

  const loanToValueRatio = (totalClaimValue / collectionFloor) * 100

  return !isCardView ? (
    <div className={styles.lentInfo}>
      <span>{formattedClaimValue}</span>
      {createLtvValueJSX(loanToValueRatio)}
    </div>
  ) : (
    <span>
      {formattedClaimValue} ({createLtvValueJSX(loanToValueRatio)})
    </span>
  )
}

const createLtvValueJSX = (ltv: number) => {
  const colorLTV = getColorByPercent(ltv, HealthColorIncreasing)

  return (
    <span className={styles.lentInfoSubtitle} style={{ color: colorLTV }}>
      {createPercentValueJSX(ltv)} LTV
    </span>
  )
}
