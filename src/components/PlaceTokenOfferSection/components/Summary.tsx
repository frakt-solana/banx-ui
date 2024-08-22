import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { TokenMarketPreview } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { useNftTokenType } from '@banx/store/nft'
import {
  HealthColorIncreasing,
  convertAprToApy,
  getColorByPercent,
  getTokenDecimals,
} from '@banx/utils'

import { calculateLtvPercent } from '../helpers'

import styles from '../PlaceTokenOfferSection.module.less'

interface MainSummaryProps {
  market: TokenMarketPreview | undefined
  collateralPerToken: string
  apr: number
}

const COMPOUNDING_PERIODS = 12

export const MainSummary: FC<MainSummaryProps> = ({ market, collateralPerToken, apr }) => {
  const { collateralPrice = 0 } = market || {}

  const { tokenType } = useNftTokenType()
  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType))

  const ltvPercent = calculateLtvPercent({
    collateralPerToken,
    collateralPrice,
    marketTokenDecimals,
  })

  const apy = apr ? convertAprToApy(apr / 100, COMPOUNDING_PERIODS) : 0

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
        label="APY"
        value={apy}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ value: styles.aprValue, container: styles.mainSummaryStat }}
        tooltipText="APY"
      />
    </div>
  )
}

interface OfferSummaryProps {
  offerSize: number
  apr: number
}

export const AdditionalSummary: FC<OfferSummaryProps> = ({ offerSize, apr }) => {
  const currentTimeUnix = moment().unix()
  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: offerSize,
    startTime: currentTimeUnix,
    currentTime: currentTimeUnix + SECONDS_IN_DAY * 7,
    rateBasePoints: apr * 100,
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
