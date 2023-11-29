import { FC, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { CollectionMeta, Loan, Offer } from '@banx/api/core'
import { ChevronDown } from '@banx/icons'

import ActiveLoansTable from '../ActiveLoansTable'
import { AdditionalOfferOverview, MainOfferOverview } from './components'

import styles from './OfferCard.module.less'

interface OfferCardProps {
  offer: Offer
  loans: Loan[]
  collectionMeta: CollectionMeta
}

const OfferCard: FC<OfferCardProps> = ({ offer, loans, collectionMeta }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.card}>
      <div className={styles.cardBody} onClick={() => setIsOpen(!isOpen)}>
        <MainOfferOverview offer={offer} collectionMeta={collectionMeta} />
        <AdditionalOfferOverview loans={loans} offer={offer} />
        <Button
          type="circle"
          className={classNames(styles.chevronButton, { [styles.active]: isOpen })}
        >
          <ChevronDown />
        </Button>
      </div>
      {isOpen && <ActiveLoansTable loans={loans} />}
    </div>
  )
}

export default OfferCard
