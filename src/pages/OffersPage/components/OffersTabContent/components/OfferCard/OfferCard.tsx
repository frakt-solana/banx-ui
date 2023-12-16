import { FC, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import PlaceOfferSection from '@banx/components/PlaceOfferSection/PlaceOfferSection'

import { CollectionMeta, Loan, Offer } from '@banx/api/core'
import { ChevronDown } from '@banx/icons'
import { convertToSynthetic, useSyntheticOffers } from '@banx/store'

import { AdditionalOfferOverview, MainOfferOverview } from './components'

import styles from './OfferCard.module.less'

interface OfferCardProps {
  offer: Offer
  loans: Loan[]
  collectionMeta: CollectionMeta
}

const OfferCard: FC<OfferCardProps> = ({ offer, loans, collectionMeta }) => {
  const [isOpen, setIsOpen] = useState(false)

  const { setOffer: setSyntheticOffer } = useSyntheticOffers()

  const onCardClick = () => {
    setSyntheticOffer(convertToSynthetic(offer, true))
    setIsOpen(!isOpen)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardBody} onClick={onCardClick}>
        <MainOfferOverview offer={offer} collectionMeta={collectionMeta} />
        <AdditionalOfferOverview
          loans={loans}
          offer={offer}
          className={isOpen ? styles.hiddenAdditionalOverview : ''}
        />
        <Button
          type="circle"
          className={classNames(styles.chevronButton, { [styles.active]: isOpen })}
        >
          <ChevronDown />
        </Button>
      </div>
      {isOpen && (
        <PlaceOfferSection offerPubkey={offer.publicKey} marketPubkey={offer.hadoMarket} />
      )}
    </div>
  )
}

export default OfferCard
