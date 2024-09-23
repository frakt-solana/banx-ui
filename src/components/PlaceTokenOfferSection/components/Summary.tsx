import { FC } from 'react'

import classNames from 'classnames'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import moment from 'moment'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { TokenMarketPreview } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { useTokenType } from '@banx/store/common'
import { HealthColorIncreasing, getColorByPercent, getTokenDecimals } from '@banx/utils'

import { calculateLtvPercent } from '../helpers'

import styles from '../PlaceTokenOfferSection.module.less'

interface OfferSummaryProps {
  market: TokenMarketPreview | undefined
  collateralPerToken: string
  offerSize: number
  apr: number
}

export const AdditionalSummary: FC<OfferSummaryProps> = ({
  market,
  offerSize,
  apr,
  collateralPerToken,
}) => {
  const { collateralPrice = 0 } = market || {}

  const { tokenType } = useTokenType()
  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType))

  const ltvPercent = calculateLtvPercent({
    collateralPerToken,
    collateralPrice,
    marketTokenDecimals,
  })

  const borrowApr = apr ? calcBorrowerTokenAPR(apr) : 0

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
        label="Borrow APR"
        value={borrowApr}
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
