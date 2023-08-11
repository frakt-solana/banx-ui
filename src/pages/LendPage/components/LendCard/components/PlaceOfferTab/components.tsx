import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import styles from './PlaceOfferTab.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketAPR: number
}

export const OfferSummary: FC<OfferSummaryProps> = ({ offerSize, marketAPR }) => {
  const interest = marketAPR / 100 / 52

  return (
    <div className={styles.offerSummary}>
      <StatInfo label="Offer size" value={offerSize} flexType="row" />
      <StatInfo
        label="Estimated interest"
        valueType={VALUES_TYPES.PERCENT}
        value={interest}
        flexType="row"
      />
    </div>
  )
}

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

interface OfferActionButtonsProps {
  isEdit: boolean
  onCreateOffer: () => void
  onRemoveOffer: () => void
  onUpdateOffer: () => void
}

export const OfferActionButtons: FC<OfferActionButtonsProps> = ({
  isEdit,
  onCreateOffer,
  onRemoveOffer,
  onUpdateOffer,
}) => {
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
          <Button onClick={onUpdateOffer} className={styles.button}>
            Update offer
          </Button>
        </>
      ) : (
        <Button onClick={onCreateOffer} className={styles.button}>
          {!connected ? 'Connect wallet' : 'Place'}
        </Button>
      )}
    </div>
  )
}
