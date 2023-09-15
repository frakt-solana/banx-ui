import { FC } from 'react'

import { InputCounter, InputErrorMessage, NumericInputField } from '@banx/components/inputs'

import { OrderBookMarketParams } from '../ExpandableCardContent'
import { OfferActionButtons, OfferHeader, OfferSummary } from './components'
import { usePlaceOfferTab } from './hooks'

import styles from './PlaceOfferTab.module.less'

const PlaceOfferTab: FC<OrderBookMarketParams> = (props) => {
  const {
    isEditMode,
    exitEditMode,
    loansAmount,
    onLoanAmountChange,
    loanValue,
    onLoanValueChange,
    offerTransactions,
    offerSize,
    marketApr,
    showDepositError,
    disableUpdateOffer,
    disablePlaceOffer,
  } = usePlaceOfferTab({ ...props })

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={isEditMode} exitEditMode={exitEditMode} />
      <div className={styles.fields}>
        <NumericInputField
          label="Offer"
          value={loanValue}
          onChange={onLoanValueChange}
          className={styles.numericField}
          hasError
        />
        <InputCounter label="Number of loans" onChange={onLoanAmountChange} value={loansAmount} />
      </div>
      <InputErrorMessage message={showDepositError ? 'Not enough SOL' : ''} />
      <OfferSummary offerSize={offerSize} marketAPR={marketApr} />
      <OfferActionButtons
        isEditMode={isEditMode}
        disableUpdateOffer={disableUpdateOffer}
        disablePlaceOffer={disablePlaceOffer}
        {...offerTransactions}
      />
    </div>
  )
}

export default PlaceOfferTab
