import { FC } from 'react'

import { BN } from 'fbonds-core'
import { calculateCurrentInterestSolPureBN } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { coreNew } from '@banx/api/nft'
import { SECONDS_IN_DAY } from '@banx/constants'
import { HealthColorIncreasing, ZERO_BN, calculateApr, getColorByPercent } from '@banx/utils'

import { calcMaxLtv, calcOfferSize } from './helpers'

import styles from './Summary.module.less'

interface OfferSummaryProps {
  initialOffer: coreNew.Offer | undefined
  updatedOffer: coreNew.Offer | undefined
  hasFormChanges: boolean
  market: coreNew.MarketPreview | undefined
}

export const MainSummary: FC<OfferSummaryProps> = ({
  initialOffer,
  updatedOffer,
  market,
  hasFormChanges,
}) => {
  const { collectionFloor = ZERO_BN } = market || {}

  const initialMaxOfferValue = initialOffer?.validation.loanToValueFilter || ZERO_BN
  const updatedMaxOfferValue = updatedOffer?.validation.loanToValueFilter || ZERO_BN
  const maxOfferValue = BN.max(initialMaxOfferValue, updatedMaxOfferValue)

  const maxLtv = calcMaxLtv({
    initialOffer,
    updatedOffer,
    collectionFloor: collectionFloor.toNumber(),
    hasFormChanges,
  })

  const maxDynamicApr =
    calculateApr({
      loanValue: maxOfferValue,
      collectionFloor,
      marketPubkey: market?.marketPubkey,
    }).toNumber() / 100

  return (
    <div className={styles.mainSummary}>
      <StatInfo
        label="Max LTV"
        value={maxLtv}
        tooltipText="Your max offer expressed as loan-to-value, given sufficient liquidity in your offer. Actual loan amount taken can be less depending on the amount of SOL borrowers choose to borrow"
        valueType={VALUES_TYPES.PERCENT}
        valueStyles={{ color: getColorByPercent(maxLtv, HealthColorIncreasing) }}
        classNamesProps={{ container: styles.mainSummaryStat, value: styles.fixedValueContent }}
      />
      <div className={styles.separateLine} />
      <StatInfo
        label="Max Apr"
        value={maxDynamicApr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ value: styles.aprValue, container: styles.mainSummaryStat }}
        tooltipText="Your maximum annual interest rate. Ranges between 34-104% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken by a borrower"
      />
    </div>
  )
}

export const AdditionalSummary: FC<OfferSummaryProps> = ({
  initialOffer,
  updatedOffer,
  hasFormChanges,
  market,
}) => {
  const { collectionFloor = ZERO_BN } = market || {}
  const loansQuantity = updatedOffer?.buyOrdersQuantity || ZERO_BN
  const offerSize = calcOfferSize({ initialOffer, updatedOffer, hasFormChanges })

  const maxDynamicApr = calculateApr({
    loanValue: offerSize,
    collectionFloor,
    marketPubkey: updatedOffer?.hadoMarket,
  })

  const weeklyFee = calculateCurrentInterestSolPureBN({
    loanValue: offerSize,
    startTime: new BN(moment().unix()),
    currentTime: new BN(moment().unix() + SECONDS_IN_DAY * 7),
    rateBasePoints: maxDynamicApr,
  })

  return (
    <div className={styles.additionalSummary}>
      <StatInfo
        label="Funding at least"
        value={`${loansQuantity} loans`}
        tooltipText="The minimum amount of loans you will fund if the entire liquidity in offer is lent at the Max Offer value. As borrowers can borrow at loan values equal to or less than your Max Offer, you may end up funding more loans"
        flexType="row"
      />
      <StatInfo
        label="Total liquidity in offer"
        value={<DisplayValue value={offerSize.toNumber()} />}
        tooltipText="Your total liquidity currently available in offer"
        classNamesProps={{ value: styles.fixedValueContent }}
        flexType="row"
      />
      <StatInfo
        label="Est. weekly interest"
        value={<DisplayValue value={weeklyFee.toNumber()} />}
        tooltipText="Expected interest on a loan over the course of a week"
        classNamesProps={{ value: styles.fixedValueContent }}
        flexType="row"
      />
    </div>
  )
}
