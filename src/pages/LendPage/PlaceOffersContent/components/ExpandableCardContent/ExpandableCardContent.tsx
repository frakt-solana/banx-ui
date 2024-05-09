import { FC, useState } from 'react'

import PlaceOfferSection, {
  checkIsEditMode,
  useSyntheticOffer,
} from '@banx/components/PlaceOfferSection'

import { useModal } from '@banx/store'

import { OfferHeader, OffersModal, TabsContent } from './components'

import styles from './ExpandableCardContent.module.less'

interface ExpandableCardContentProps {
  marketPubkey: string
}

const ExpandableCardContent: FC<ExpandableCardContentProps> = ({ marketPubkey }) => {
  const [offerPubkey, setOfferPubkey] = useState('')
  const { open } = useModal()

  const { removeSyntheticOffer } = useSyntheticOffer(offerPubkey, marketPubkey)

  const exitEditMode = () => {
    setOfferPubkey('')
    removeSyntheticOffer()
  }

  const showModal = () => {
    open(OffersModal, { setOfferPubkey, offerPubkey, marketPubkey })
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <OfferHeader
          isEditMode={checkIsEditMode(offerPubkey)}
          showModal={showModal}
          exitEditMode={exitEditMode}
        />
        <PlaceOfferSection
          offerPubkey={offerPubkey}
          marketPubkey={marketPubkey}
          setOfferPubkey={setOfferPubkey}
        />
      </div>
      <div className={styles.tabsContent}>
        <TabsContent
          marketPubkey={marketPubkey}
          offerPubkey={offerPubkey}
          setOfferPubkey={setOfferPubkey}
        />
      </div>
    </div>
  )
}

export default ExpandableCardContent
