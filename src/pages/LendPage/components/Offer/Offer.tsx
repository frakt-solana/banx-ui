import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { isInteger } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Pencil } from '@banx/icons'
import { SyntheticOffer } from '@banx/store'

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

  const { loanValue, loansAmount } = offer

  const displayLoansAmount = formatLoansAmount(loansAmount)

  const listItemClassName = classNames(styles.listItem, {
    [styles.highlightBest]: isBestOffer,
    [styles.highlightEditing]: offer.isEdit,
    [styles.highlightYour]: connected && offer.publicKey === PUBKEY_PLACEHOLDER,
  })

  const displayLoanValue = ((loanValue || 0) / 1e9)?.toFixed(2)

  return (
    <li className={listItemClassName}>
      <div className={styles.valueWrapper}>
        <p className={styles.value}>{displayLoanValue}</p>
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

export const formatLoansAmount = (loansAmount = 0) => {
  if (loansAmount < 1) {
    return '1'
  }

  if (isInteger(loansAmount)) {
    return String(loansAmount)
  }

  return loansAmount.toFixed(2)
}
