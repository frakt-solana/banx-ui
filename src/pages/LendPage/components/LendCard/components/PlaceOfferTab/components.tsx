import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { useWalletModal } from '@banx/components/WalletModal'

import styles from './PlaceOfferTab.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketAPR: number
}

export const OfferSummary: FC<OfferSummaryProps> = ({ offerSize, marketAPR }) => {
  const weeklyAprPercentage = marketAPR / 100 / 52
  const estimatedInterest = (offerSize * weeklyAprPercentage) / 100

  return (
    <div className={styles.offerSummary}>
      <StatInfo label="Offer size" value={offerSize} flexType="row" />
      <StatInfo label="Estimated interest" value={estimatedInterest} flexType="row" />
    </div>
  )
}

interface OfferHeaderProps {
  isEditMode: boolean
  goToPlaceOffer: () => void
}

export const OfferHeader: FC<OfferHeaderProps> = ({ isEditMode, goToPlaceOffer }) => {
  const title = isEditMode ? 'Offer editing' : 'Offer creation'

  return (
    <div className={styles.offerHeaderContent}>
      <h4 className={styles.title}>{title}</h4>
      {isEditMode && (
        <Button type="circle" variant="text" onClick={goToPlaceOffer}>
          Exit
        </Button>
      )}
    </div>
  )
}

interface OfferActionButtonsProps {
  isEditMode: boolean
  disableUpdateOffer: boolean
  onCreateOffer: () => void
  onRemoveOffer: () => void
  onUpdateOffer: () => void
}

export const OfferActionButtons: FC<OfferActionButtonsProps> = ({
  isEditMode,
  disableUpdateOffer,
  onCreateOffer,
  onRemoveOffer,
  onUpdateOffer,
}) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()

  const onToggleWalletModal = () => toggleVisibility()

  return (
    <div className={styles.buttonsWrapper}>
      {isEditMode ? (
        <>
          <Button
            variant="secondary"
            onClick={onRemoveOffer}
            className={classNames(styles.button, styles.deleteOfferButton)}
          >
            Delete offer
          </Button>
          <Button onClick={onUpdateOffer} className={styles.button} disabled={disableUpdateOffer}>
            Update offer
          </Button>
        </>
      ) : (
        <Button onClick={connected ? onCreateOffer : onToggleWalletModal} className={styles.button}>
          {connected ? 'Place' : 'Connect wallet'}
        </Button>
      )}
    </div>
  )
}
