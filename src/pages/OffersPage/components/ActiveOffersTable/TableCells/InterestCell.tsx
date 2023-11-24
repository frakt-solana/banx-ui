import { FC } from 'react'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import { caclulateClaimValue } from '../../OffersTabContent/components/OfferCard/helpers'

import styles from '../ActiveOffersTable.module.less'

interface InterestCellProps {
  loan: Loan
}

export const InterestCell: FC<InterestCellProps> = ({ loan }) => {
  const collectionFloor = loan.nft.collectionFloor

  const totalClaimValue = caclulateClaimValue(loan)

  const formattedClaimValue = createSolValueJSX(totalClaimValue, 1e9, '--', formatDecimal)

  const loanToValueRatio = (totalClaimValue / collectionFloor) * 100

  return (
    <div className={styles.lentInfo}>
      <span>{formattedClaimValue}</span>
      {createLtvValueJSX(loanToValueRatio)}
    </div>
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
