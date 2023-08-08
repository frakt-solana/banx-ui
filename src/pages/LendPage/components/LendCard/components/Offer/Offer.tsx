import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { Pencil } from '@banx/icons'

import styles from './Offer.module.less'

const MOCK_LOAN_AMOUNT = 10
const MOCK_IS_OWN_ORDER = true
const MOCK_EDIT_OFFER = true

const Offer = () => {
  const loanAmount = MOCK_LOAN_AMOUNT
  const isOwnOrder = MOCK_IS_OWN_ORDER
  const editOrder = MOCK_EDIT_OFFER

  const displayLoanAmount = loanAmount < 1 ? '< 1' : loanAmount || 0

  const listItemClassName = classNames(styles.listItem, {
    [styles.highlightBest]: false,
    [styles.highlightYourOffer]: false,
  })

  return (
    <li className={listItemClassName}>
      <div className={styles.valueWrapper}>
        <p className={styles.value}>{displayLoanAmount}</p>
        <p className={styles.value}>{displayLoanAmount}</p>
      </div>
      {isOwnOrder && editOrder && (
        <Button type="circle" variant="secondary" size="medium" className={styles.editButton}>
          <Pencil />
        </Button>
      )}
    </li>
  )
}

export default Offer
