import { FC } from 'react'

import { InputCounter, InputErrorMessage, NumericInputField } from '@banx/components/inputs'

import { OfferActionButtons, OfferHeader, OfferSummary } from './components'
import { usePlaceOfferTab } from './hooks'

import styles from './PlaceOfferTab.module.less'

interface PlaceOfferTab {
  marketPubkey: string
}

const PlaceOfferTab: FC<PlaceOfferTab> = ({ marketPubkey }) => {
  const {
    isEditMode,
    goToPlaceOffer,
    loansAmount,
    onLoanAmountChange,
    loanValue,
    onLoanValueChange,
    offerTransactions,
    offerSize,
    marketAPR,
    showDepositError,
    disableUpdateOffer,
    disablePlaceOffer,
  } = usePlaceOfferTab(marketPubkey)

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={isEditMode} goToPlaceOffer={goToPlaceOffer} />
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
      <OfferSummary offerSize={offerSize} marketAPR={marketAPR} />
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
