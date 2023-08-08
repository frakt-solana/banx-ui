import { FC } from 'react'

import classNames from 'classnames'

import { colorByPercentOffers } from '@banx/constants'
import { Pencil } from '@banx/icons'
import { getColorByPercent } from '@banx/utils'

import { calculateLeftPosition, calculateLineLeftPosition } from './helpers'

import styles from './Offer.module.less'

const MOCK_LOAN_AMOUNT = 10
const MOCK_LOAN_VALUE = 10
const MOCK_FLOOR_VALUE = 10
const MOCK_SIZE_VALUE = 10
const MOCK_IS_OWN_ORDER = false
const MOCK_EDIT_OFFER = false

const OfferLite: FC = () => {
  const loanAmount = MOCK_LOAN_AMOUNT
  const loanValue = MOCK_LOAN_VALUE
  const marketFloor = MOCK_FLOOR_VALUE
  const isOwnOrder = MOCK_IS_OWN_ORDER
  const size = MOCK_SIZE_VALUE
  const editOrder = MOCK_EDIT_OFFER

  const maxLoanValue = Math.min((loanValue / marketFloor) * 100, 100)

  const displayLoanAmount = loanAmount < 1 ? '< 1' : loanAmount || 0
  const displaySize = isOwnOrder ? `/ size ${size?.toFixed(2)}◎` : ''

  const listItemClassName = classNames(styles.listItem, {
    [styles.highlightBest]: false,
    [styles.highlightYourOffer]: false,
  })

  return (
    <li className={listItemClassName}>
      <ValueDisplay label="Offer" displayValue={loanValue} maxLoanValue={maxLoanValue} />
      <div className={styles.valueWrapper}>
        <p className={styles.value}>
          {displayLoanAmount} {displaySize}
        </p>
      </div>
      {isOwnOrder && editOrder && (
        <div className={styles.editButton} onClick={editOrder}>
          <Pencil />
        </div>
      )}
    </li>
  )
}

export default OfferLite

const ValueDisplay = ({
  displayValue,
  maxLoanValue,
  label,
}: {
  displayValue: number
  maxLoanValue: number
  label: string
}) => {
  const colorValue = getColorByPercent(maxLoanValue, colorByPercentOffers)

  const valueStyle = {
    background: colorValue,
    left: calculateLeftPosition(maxLoanValue),
  }

  const lineStyle = {
    borderColor: colorValue,
    left: calculateLineLeftPosition(maxLoanValue),
  }

  const formattedValue = (displayValue || 0)?.toFixed(2)

  return (
    <>
      <div className={styles.loanValue} style={valueStyle}>
        {label}:<span>{formattedValue}◎</span>
      </div>
      <div className={styles.line} style={lineStyle} />
    </>
  )
}
