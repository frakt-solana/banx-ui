import React from 'react'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { Pencil } from '@banx/icons'

import styles from './OfferCard.module.less'

const OfferCard = () => {
  return (
    <div className={styles.card}>
      <MainOfferOverview />
      <AdditionalOfferOverview />
    </div>
  )
}

export default OfferCard

const MOCK_OFFER_SIZE = 600
const MOCK_ACTIVE_LOANS = 5
const MOCK_TOTAL_LOANS = 5
const OFFER_VALUE = 10

const MainOfferOverview = () => {
  return (
    <div className={styles.mainOfferContainer}>
      <img src="" className={styles.collectionImage} />
      <div className={styles.mainOfferInfo}>
        <h4 className={styles.collectionName}>Solana Monkey Business</h4>
        <div className={styles.mainOfferStats}>
          <StatInfo label="Offer" value={OFFER_VALUE} valueType={VALUES_TYPES.STRING} />
          <StatInfo
            label="Loans"
            value={`${MOCK_ACTIVE_LOANS} / ${MOCK_TOTAL_LOANS}`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo label="Size" value={MOCK_OFFER_SIZE} />
        </div>
      </div>
      <div className={styles.actionsOfferButtons}>
        <Button type="circle" variant="secondary" size="medium">
          <Pencil />
        </Button>
        <Button type="circle" variant="secondary" size="medium">
          <Pencil />
        </Button>
      </div>
    </div>
  )
}

const AdditionalOfferOverview = () => {
  return (
    <div className={styles.additionalOfferContainer}>
      <StatInfo label="Lent" value={0} />
      <StatInfo label="Repaid" value={0} />
      <StatInfo label="Claim" value={0} />
      <StatInfo label="APY" value={0} valueType={VALUES_TYPES.PERCENT} />
      <StatInfo label="Interest" value={0} />
    </div>
  )
}
