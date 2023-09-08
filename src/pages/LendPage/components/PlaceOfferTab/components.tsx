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

const WEEKS_IN_YEAR = 52

export const OfferSummary: FC<OfferSummaryProps> = ({ offerSize, marketAPR }) => {
  const weeklyAprPercentage = marketAPR / 100 / WEEKS_IN_YEAR
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
  disablePlaceOffer: boolean
  onCreateOffer: () => void
  onRemoveOffer: () => void
  onUpdateOffer: () => void
}

export const OfferActionButtons: FC<OfferActionButtonsProps> = ({
  isEditMode,
  disableUpdateOffer,
  disablePlaceOffer,
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
            Remove
          </Button>
          <Button onClick={onUpdateOffer} className={styles.button} disabled={disableUpdateOffer}>
            Apply changes
          </Button>
        </>
      ) : (
        <Button
          onClick={connected ? onCreateOffer : onToggleWalletModal}
          className={styles.button}
          disabled={disablePlaceOffer}
        >
          {connected ? 'Place' : 'Connect wallet'}
        </Button>
      )}
    </div>
  )
}
