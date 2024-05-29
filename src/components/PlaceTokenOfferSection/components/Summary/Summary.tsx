import React, { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { SECONDS_IN_DAY } from '@banx/constants'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import styles from './Summary.module.less'

export const MainSummary = () => {
  const ltv = 0
  const apr = 0

  return (
    <div className={styles.mainSummary}>
      <StatInfo
        label="LTV"
        value={ltv}
        tooltipText="Your max offer expressed as loan-to-value, given sufficient liquidity in your offer. Actual loan amount taken can be less depending on the amount of SOL borrowers choose to borrow"
        valueType={VALUES_TYPES.PERCENT}
        valueStyles={{ color: getColorByPercent(ltv, HealthColorIncreasing) }}
        classNamesProps={{ container: styles.mainSummaryStat, value: styles.fixedValueContent }}
      />
      <div className={styles.separateLine} />
      <StatInfo
        label="Apr"
        value={apr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ value: styles.aprValue, container: styles.mainSummaryStat }}
        tooltipText="Your maximum annual interest rate. Ranges between 34-104% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken by a borrower"
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
    rateBasePoints: 0,
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
