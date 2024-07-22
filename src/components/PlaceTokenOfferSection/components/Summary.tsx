import { FC } from 'react'

import {
  calculateAPRforOffer,
  calculateCurrentInterestSolPure,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { TokenMarketPreview } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { useNftTokenType } from '@banx/store/nft'
import { HealthColorIncreasing, getColorByPercent, getTokenDecimals } from '@banx/utils'

import styles from '../PlaceTokenOfferSection.module.less'

interface MainSummaryProps {
  market: TokenMarketPreview | undefined
  collateralPerToken: number
}

export const MainSummary: FC<MainSummaryProps> = ({ market, collateralPerToken }) => {
  const { collateralPrice = 0, collateral } = market || {}

  const ltvPercent = (collateralPerToken / collateralPrice) * 100 || 0
  const fullyDilutedValuationNumber = collateral
    ? parseFloat(collateral.fullyDilutedValuationInMillions)
    : 0
  const { factoredApr: aprPercent } = calculateAPRforOffer(ltvPercent, fullyDilutedValuationNumber)

  return (
    <div className={styles.mainSummary}>
      <StatInfo
        label="LTV"
        value={ltvPercent}
        tooltipText="LTV"
        valueType={VALUES_TYPES.PERCENT}
        valueStyles={{ color: getColorByPercent(ltvPercent, HealthColorIncreasing) }}
        classNamesProps={{ container: styles.mainSummaryStat, value: styles.fixedValueContent }}
      />
      <div className={styles.separateLine} />
      <StatInfo
        label="APR"
        value={aprPercent}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ value: styles.aprValue, container: styles.mainSummaryStat }}
        tooltipText="APR"
      />
    </div>
  )
}

interface OfferSummaryProps {
  market: TokenMarketPreview | undefined
  collateralPerToken: number
  offerSize: number
}

export const AdditionalSummary: FC<OfferSummaryProps> = ({
  market,
  collateralPerToken,
  offerSize,
}) => {
  const { tokenType } = useNftTokenType()
  const tokenDecimals = getTokenDecimals(tokenType)

  const { collateralPrice = 0, collateral } = market || {}

  const ltvPercent = (collateralPerToken / collateralPrice) * 100 || 0

  const fullyDilutedValuationNumber = collateral
    ? parseFloat(collateral.fullyDilutedValuationInMillions)
    : 0
  const { factoredApr: aprPercent } = calculateAPRforOffer(ltvPercent, fullyDilutedValuationNumber)

  const currentTimeUnix = moment().unix()
  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: offerSize * tokenDecimals,
    startTime: currentTimeUnix,
    currentTime: currentTimeUnix + SECONDS_IN_DAY * 7,
    rateBasePoints: aprPercent * 100,
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
