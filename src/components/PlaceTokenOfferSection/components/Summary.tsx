import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { TokenMarketPreview } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import styles from '../PlaceTokenOfferSection.module.less'

interface MainSummaryProps {
  market: TokenMarketPreview | undefined
  collateralPerToken: number
}

export const MainSummary: FC<MainSummaryProps> = ({ market, collateralPerToken }) => {
  const { collateralTokenPrice = 0 } = market || {}

  const ltv = (collateralPerToken / collateralTokenPrice) * 100 || 0
  const apr = 0 //TODO (TokenLending): Use rateBasePoints from market or calculate dynamically?

  return (
    <div className={styles.mainSummary}>
      <StatInfo
        label="LTV"
        value={ltv}
        tooltipText="LTV"
        valueType={VALUES_TYPES.PERCENT}
        valueStyles={{ color: getColorByPercent(ltv, HealthColorIncreasing) }}
        classNamesProps={{ container: styles.mainSummaryStat, value: styles.fixedValueContent }}
      />
      <div className={styles.separateLine} />
      <StatInfo
        label="APR"
        value={apr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ value: styles.aprValue, container: styles.mainSummaryStat }}
        tooltipText="APR"
      />
    </div>
  )
}

interface OfferSummaryProps {
  offerSize: number
}

export const AdditionalSummary: FC<OfferSummaryProps> = ({ offerSize }) => {
  const currentTimeUnix = moment().unix()
  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: offerSize,
    startTime: currentTimeUnix,
    currentTime: currentTimeUnix + SECONDS_IN_DAY * 7,
    rateBasePoints: 0, //TODO (TokenLending): Use rateBasePoints from market or calculate dynamically?
  })

  return (
    <div className={styles.additionalSummary}>
      <StatInfo
        label="Est. weekly interest"
        value={<DisplayValue value={weeklyFee} />}
        tooltipText="Expected interest on a loan over the course of a week"
        classNamesProps={{ value: styles.fixedValueContent }}
        flexType="row"
      />
    </div>
  )
}