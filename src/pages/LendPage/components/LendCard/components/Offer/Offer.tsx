import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { Pencil } from '@banx/icons'

import { MarketOrder } from '../OrderBook'

import styles from './Offer.module.less'

interface OfferProps {
  offer: MarketOrder
  loanAmount: number
  loanValue: number
  editOffer: () => void
  isOwnOrder: boolean
}

const Offer: FC<OfferProps> = ({ loanAmount, loanValue, editOffer, offer, isOwnOrder }) => {
  const displayLoanAmount = loanAmount < 1 ? '< 1' : loanAmount || 0

  const listItemClassName = classNames(styles.listItem, {
    [styles.highlightBest]: false,
    [styles.highlightYourOffer]: offer.synthetic,
  })

  return (
    <li className={listItemClassName}>
      <div className={styles.valueWrapper}>
        <p className={styles.value}>{loanValue}</p>
        <p className={styles.value}>{displayLoanAmount}</p>
      </div>
      {isOwnOrder && editOffer && (
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
