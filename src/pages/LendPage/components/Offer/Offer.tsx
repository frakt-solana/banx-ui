import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { Button } from '@banx/components/Buttons'

import { Pencil } from '@banx/icons'
import { SyntheticOffer } from '@banx/store'
import { formatDecimal, formatLoansAmount } from '@banx/utils'

import styles from './Offer.module.less'

interface OfferProps {
  offer: SyntheticOffer
  bestOffer: SyntheticOffer
  editOffer: () => void
}

const Offer: FC<OfferProps> = ({ editOffer, offer, bestOffer }) => {
  const { connected, publicKey } = useWallet()

  const {
    publicKey: offerPubkey,
    isEdit,
    loanValue,
    loansAmount,
    deltaValue,
    assetReceiver,
  } = offer

  const isOwnOffer = assetReceiver && publicKey?.toBase58()
  const isBestOffer = offerPubkey === bestOffer?.publicKey
  const isNewOffer = offerPubkey === PUBKEY_PLACEHOLDER
  const isCreatingOffer = connected && isNewOffer

  const listItemClassNames = classNames(styles.listItem, {
    [styles.highlightYour]: isCreatingOffer,
    [styles.highlightBest]: isBestOffer,
    [styles.highlightEditing]: isEdit,
  })

  const displayLoanValue = formatDecimal(loanValue / 1e9)
  const displayLoansAmount = formatLoansAmount(loansAmount)
  const displayDeltaValue = deltaValue ? `| Δ${formatDecimal(deltaValue / 1e9)}◎` : ''

  return (
    <li className={listItemClassNames}>
      <div className={styles.valueWrapper}>
        <p className={styles.value}>
          {displayLoanValue} {displayDeltaValue}
        </p>
        <p className={styles.value}>{displayLoansAmount}</p>
      </div>
      {isOwnOffer && !isNewOffer && editOffer && (
        <Button
          onClick={editOffer}
          type="circle"
          variant="secondary"
          size="medium"
          className={styles.editButton}
        >
          <Pencil />
        </Button>
      )}
    </li>
  )
}

export default Offer
