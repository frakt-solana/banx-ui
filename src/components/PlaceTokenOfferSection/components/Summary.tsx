import { FC } from 'react'

import classNames from 'classnames'
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

interface OfferSummaryProps {
  market: TokenMarketPreview | undefined
  collateralPerToken: string
  offerSize: number
  apr: number
}

const COMPOUNDING_PERIODS = 12

export const AdditionalSummary: FC<OfferSummaryProps> = ({
  market,
  offerSize,
  apr,
  collateralPerToken,
}) => {
  const { collateralPrice = 0 } = market || {}

  const { tokenType } = useNftTokenType()
  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType))

  const ltvPercent = calculateLtvPercent({
    collateralPerToken,
    collateralPrice,
    marketTokenDecimals,
  })

  const apy = apr ? convertAprToApy(apr / 100, COMPOUNDING_PERIODS) : 0

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
        label="LTV"
        value={ltvPercent}
        valueType={VALUES_TYPES.PERCENT}
        valueStyles={{ color: getColorByPercent(ltvPercent, HealthColorIncreasing) }}
        classNamesProps={{ value: styles.fixedValueContent }}
        flexType="row"
      />
      <StatInfo
        label="APY"
        value={apy}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ value: classNames(styles.aprValue, styles.fixedValueContent) }}
        flexType="row"
      />
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
