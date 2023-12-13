import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview, Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from '../PlaceOfferContent.module.less'

interface OfferSummaryProps {
  offerSize: number
  isEditMode: boolean
  offer: Offer | undefined
  market?: MarketPreview
  loansAmount: number
}

export const Summary: FC<OfferSummaryProps> = ({
  offer,
  offerSize,
  isEditMode,
  market,
  loansAmount,
}) => {
  const { concentrationIndex: accruedInterest = 0, buyOrdersQuantity = 0, validation } = offer || {}
  const { collectionFloor = 0, marketApr = 0 } = market || {}

  const activeLoansQuantity = validation?.maxReturnAmountFilter || 0
  const totalLoansQuantity = activeLoansQuantity + buyOrdersQuantity

  const weeklyAprPercentage = marketApr / 100 / WEEKS_IN_YEAR
  const weeklyInterest = (offerSize * weeklyAprPercentage) / 100

  const ltv = (offerSize / loansAmount / collectionFloor) * 100

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Max weighted LTV"
        value={ltv || 0}
        valueStyles={{ color: getColorByPercent(ltv, HealthColorIncreasing) }}
        flexType="row"
        tooltipText="Average LTV offered by your pool"
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo
        label="Pool size"
        value={`${formatDecimal(offerSize / 1e9)}◎`}
        flexType="row"
        valueType={VALUES_TYPES.STRING}
      />
      <StatInfo
        flexType="row"
        label="Max weekly interest"
        value={`${formatDecimal(weeklyInterest / 1e9)}◎`}
        valueType={VALUES_TYPES.STRING}
      />

      {isEditMode && (
        <div className={styles.editSummary}>
          <StatInfo
            label="Active loans"
            value={`${activeLoansQuantity}/${totalLoansQuantity}`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo
            label="Accrued interest"
            value={`${formatDecimal(accruedInterest / 1e9)}◎`}
            valueType={VALUES_TYPES.STRING}
          />
        </div>
      )}
    </div>
  )
}
