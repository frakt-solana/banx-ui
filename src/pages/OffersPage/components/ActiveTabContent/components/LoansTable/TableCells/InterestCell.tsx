import { FC } from 'react'

import { RowCell, createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateClaimValue } from '@banx/pages/OffersPage'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from '../LoansTable.module.less'

interface InterestCellProps {
  loan: Loan
  isCardView?: boolean
}

export const InterestCell: FC<InterestCellProps> = ({ loan, isCardView = false }) => {
  const collectionFloor = loan.nft.collectionFloor

  const totalClaimValue = calculateClaimValue(loan)

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

const createLtvValueJSX = (ltv: number) => (
  <RowCell
    textColor={getColorByPercent(ltv, HealthColorIncreasing)}
    value={createPercentValueJSX(ltv)}
  />
)
