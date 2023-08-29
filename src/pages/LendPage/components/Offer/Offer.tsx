import { FC } from 'react'

import classNames from 'classnames'
import { isInteger } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Pencil } from '@banx/icons'

import { Order } from '../OrderBook'

import styles from './Offer.module.less'

interface OfferProps {
  order: Order
  loansAmount: number
  loanValue: number
  editOffer: () => void
  isOwnOrder: boolean
  bestOrder: Order
}

const Offer: FC<OfferProps> = ({
  loansAmount,
  loanValue,
  editOffer,
  order,
  isOwnOrder,
  bestOrder,
}) => {
  const isBestOrder = order.rawData.publicKey === bestOrder?.rawData.publicKey

  const displayLoansAmount = isInteger(loansAmount) ? loansAmount : loansAmount?.toFixed(2)

  const listItemClassName = classNames(styles.listItem, {
    [styles.highlightBest]: isBestOrder,
    [styles.highlightYourOffer]: order.synthetic,
  })

  return (
    <li className={listItemClassName}>
      <div className={styles.valueWrapper}>
        <p className={styles.value}>{loanValue?.toFixed(2)}</p>
        <p className={styles.value}>{displayLoansAmount}</p>
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
