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
  editOffer: () => void
  isOwnOffer: boolean
  bestOffer: SyntheticOffer
}

const Offer: FC<OfferProps> = ({ editOffer, offer, isOwnOffer, bestOffer }) => {
  const { connected } = useWallet()
  const isBestOffer = offer.publicKey === bestOffer?.publicKey

  const isNewOffer = offer.publicKey === PUBKEY_PLACEHOLDER

  const { loanValue, loansAmount, deltaValue } = offer

  const displayLoansAmount = formatLoansAmount(loansAmount)

  const listItemClassName = classNames(styles.listItem, {
    [styles.highlightBest]: isBestOffer,
    [styles.highlightEditing]: offer.isEdit,
    [styles.highlightYour]: connected && offer.publicKey === PUBKEY_PLACEHOLDER,
  })

  const displayLoanValue = formatDecimal((loanValue || 0) / 1e9)
  const displayDeltaValue = deltaValue ? `- Δ${deltaValue}◎` : ''

  return (
    <li className={listItemClassName}>
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
