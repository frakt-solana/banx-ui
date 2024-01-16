import { FC, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import PlaceOfferSection from '@banx/components/PlaceOfferSection'

import { UserOffer } from '@banx/api/core'
import { Pencil } from '@banx/icons'
import { convertToSynthetic, useSyntheticOffers } from '@banx/store'

import { AdditionalOfferOverview, MainOfferOverview } from './components'

import styles from './OfferCard.module.less'

interface OfferCardProps {
  offer: UserOffer
}

const OfferCard: FC<OfferCardProps> = ({ offer }) => {
  const [isOpen, setIsOpen] = useState(false)

  const { setOffer: setSyntheticOffer } = useSyntheticOffers()

  const onCardClick = () => {
    setSyntheticOffer(convertToSynthetic(offer.offer, true))
    setIsOpen(!isOpen)
  }

  return (
    <div className={styles.card}>
      <div
        className={classNames(styles.cardBody, { [styles.active]: isOpen })}
        onClick={onCardClick}
      >
        <MainOfferOverview offer={offer} />
        <AdditionalOfferOverview
          offer={offer}
          className={isOpen ? styles.hiddenAdditionalOverview : ''}
        />
        <Button
          type="circle"
          className={classNames(styles.editButton, { [styles.active]: isOpen })}
        >
          <Pencil />
        </Button>
      </div>
      {isOpen && (
        <div className={styles.placeOfferContent}>
          <PlaceOfferSection
            offerPubkey={offer.offer.publicKey}
            marketPubkey={offer.offer.hadoMarket}
          />
        </div>
      )}
    </div>
  )
}

export default OfferCard
