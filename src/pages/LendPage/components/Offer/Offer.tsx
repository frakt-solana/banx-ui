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
  const { connected, publicKey } = useWallet()

  const {
    publicKey: offerPubkey,
    isEdit,
    loanValue,
    loansAmount,
    deltaValue,
    assetReceiver,
  } = offer

  const isOwnOffer = assetReceiver === publicKey?.toBase58()
  const isNewOffer = offerPubkey === PUBKEY_PLACEHOLDER
  const isCreatingOffer = connected && isNewOffer

  const listItemClassNames = classNames(styles.listItem, {
    [styles.highlightYour]: isCreatingOffer,
    [styles.highlightEditing]: isEdit,
  })

  const minDeltaValue = loanValue - (loansAmount - 1) * deltaValue

  const formattedLoanValue = formatDecimal(loanValue / 1e9)
  const formattedMinLoanValue = formatDecimal(minDeltaValue / 1e9)

  const displayOfferValue = deltaValue
    ? `${formattedLoanValue} - ${formattedMinLoanValue}`
    : formattedLoanValue

  return (
    <li className={listItemClassNames}>
      <div className={styles.valueWrapper}>
        <p className={styles.value}>{`${displayOfferValue}◎`}</p>
        <p className={styles.value}>{loansAmount || 0}</p>
      </div>
      {isOwnOffer && !isNewOffer && editOffer && (
        <Button
          onClick={editOffer}
          type="circle"
          variant="secondary"
          size="medium"
          className={styles.editButton}
        >
          <Tooltip title="Edit">
            <div className={styles.tooltipInnerContent}>
              <Pencil />
            </div>
          </Tooltip>
        </Button>
      )}
    </li>
  )
}

export default Offer
