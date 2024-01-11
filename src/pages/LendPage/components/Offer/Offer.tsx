import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { Button } from '@banx/components/Buttons'
import Tooltip from '@banx/components/Tooltip'

import { Pencil } from '@banx/icons'
import { SyntheticOffer } from '@banx/store'
import { formatDecimal } from '@banx/utils'

import styles from './Offer.module.less'

interface OfferProps {
  offer: SyntheticOffer
  editOffer: () => void
}

const Offer: FC<OfferProps> = ({ editOffer, offer }) => {
  const { publicKey: offerPubkey, isEdit, loansAmount, assetReceiver } = offer

  const { connected, publicKey } = useWallet()

  const isOwnOffer = assetReceiver === publicKey?.toBase58()
  const isNewOffer = connected && offerPubkey === PUBKEY_PLACEHOLDER
  const showEditOfferButton = isOwnOffer && !isNewOffer

  const commonHighlightClassNames = {
    [styles.creating]: isNewOffer,
    [styles.editing]: isEdit,
    [styles.hidden]: !isEdit && !isNewOffer,
  }

  const listItemClassNames = classNames(styles.listItem, commonHighlightClassNames)
  const highlightItemClassNames = classNames(styles.highlightItem, commonHighlightClassNames)

  const displayOfferValue = getDisplayOfferRange(offer)

  return (
    <li className={listItemClassNames}>
      <div className={highlightItemClassNames}>
        <Pencil />
      </div>

      <div className={styles.values}>
        <p className={styles.value}>{`${displayOfferValue}◎`}</p>
        <p className={styles.value}>10%</p>
        <p className={styles.value}>{loansAmount || 0}</p>
      </div>

      {showEditOfferButton && <EditOfferButton onClick={editOffer} />}
    </li>
  )
}

export default Offer

const EditOfferButton: FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button
    onClick={onClick}
    type="circle"
    variant="secondary"
    size="small"
    className={styles.editButton}
  >
    <Tooltip title="Edit">
      <div className={styles.tooltipInnerContent}>
        <Pencil />
      </div>
    </Tooltip>
  </Button>
)

const getDisplayOfferRange = (offer: SyntheticOffer) => {
  const { loanValue, loansAmount, deltaValue } = offer

  const minDeltaValue = loanValue - (loansAmount - 1) * deltaValue

  const formattedLoanValue = formatDecimal(loanValue / 1e9)
  const formattedMinLoanValue = formatDecimal(minDeltaValue / 1e9)

  const displayOfferRange = deltaValue
    ? `${formattedLoanValue} - ${formattedMinLoanValue}`
    : formattedLoanValue

  return displayOfferRange
}
