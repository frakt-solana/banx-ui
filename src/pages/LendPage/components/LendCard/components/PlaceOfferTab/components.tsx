import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import styles from './PlaceOfferTab.module.less'

export const OfferSummary = () => (
  <div className={styles.offerSummary}>
    <StatInfo label="Offer size" value="10" flexType="row" />
    <StatInfo label="Estimated interest" value="1" flexType="row" />
  </div>
)

interface OfferHeaderProps {
  isEdit: boolean
  goToPlaceOffer: () => void
}

export const OfferHeader: FC<OfferHeaderProps> = ({ isEdit, goToPlaceOffer }) => {
  const title = isEdit ? 'Offer editing' : 'Offer creation'

  return (
    <div className={styles.flexRow}>
      <h4 className={styles.title}>{title}</h4>
      {isEdit && <Button onClick={goToPlaceOffer}>Exit edit mode</Button>}
    </div>
  )
}

export const OfferActionButtons = ({ isEdit, onCreateOffer, onRemoveOffer }: any) => {
  const { connected } = useWallet()

  return (
    <div className={styles.buttonsWrapper}>
      {isEdit ? (
        <>
          <Button
            onClick={onRemoveOffer}
            className={classNames(styles.button, styles.deleteOfferButton)}
          >
            Delete offer
          </Button>
          <Button className={styles.button}>Update offer</Button>
        </>
      ) : (
        <Button onClick={onCreateOffer} className={styles.button}>
          {!connected ? 'Connect wallet' : 'Place'}
        </Button>
      )}
    </div>
  )
}
