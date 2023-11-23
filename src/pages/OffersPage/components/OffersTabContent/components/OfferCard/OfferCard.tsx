import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { CollectionMeta, Loan, Offer } from '@banx/api/core'
import { ChevronDown } from '@banx/icons'

import { AdditionalOfferOverview, MainOfferOverview } from './components'

import styles from './OfferCard.module.less'

interface OfferCardProps {
  offer: Offer
  loans: Loan[]
  collectionMeta: CollectionMeta
}

const OfferCard: FC<OfferCardProps> = ({ offer, loans, collectionMeta }) => {
  return (
    <div className={styles.card}>
      <MainOfferOverview offer={offer} collectionMeta={collectionMeta} />
      <AdditionalOfferOverview loans={loans} />
      <Button
        type="circle"
        className={classNames(styles.chevronButton, { [styles.active]: false })}
      >
        <ChevronDown />
      </Button>
    </div>
  )
}

export default OfferCard
