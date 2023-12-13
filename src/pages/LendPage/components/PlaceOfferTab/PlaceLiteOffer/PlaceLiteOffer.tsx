import { FC } from 'react'

import { InputErrorMessage } from '@banx/components/inputs'

import { BorrowerMessage, OfferActionButtons, PlaceOfferFields } from '../components'
import { OfferParams } from '../hooks'
import { OfferSummary } from './components'
import { usePlaceLiteOffer } from './hooks'

import styles from './PlaceLiteOffer.module.less'

const PlaceLiteOffer: FC<OfferParams> = (offersParams) => {
  const {
    isEditMode,
    loansAmount,
    onLoanAmountChange,
    loanValue,
    onLoanValueChange,
    onCreateOffer,
    onRemoveOffer,
    onUpdateOffer,
    offerSize,
    marketApr,
    offerErrorMessage,
    showBorrowerMessage,
    disableUpdateOffer,
    disablePlaceOffer,
    loanToValuePercent,
  } = usePlaceLiteOffer(offersParams)

  return (
    <>
      <PlaceOfferFields
        loanValue={loanValue}
        loansAmount={loansAmount}
        onLoanAmountChange={onLoanAmountChange}
        onLoanValueChange={onLoanValueChange}
      />
      <div className={styles.messageContainer}>
        {offerErrorMessage && <InputErrorMessage message={offerErrorMessage} />}
        {showBorrowerMessage && <BorrowerMessage loanValue={loanValue} />}
      </div>
      <OfferSummary
        offerSize={offerSize}
        marketAPR={marketApr}
        loanToValuePercent={loanToValuePercent}
        isEditMode={isEditMode}
        offer={offersParams.optimisticOffer}
      />
      <OfferActionButtons
        isEditMode={isEditMode}
        disableUpdateOffer={disableUpdateOffer}
        disablePlaceOffer={disablePlaceOffer}
        onCreateOffer={onCreateOffer}
        onRemoveOffer={onRemoveOffer}
        onUpdateOffer={onUpdateOffer}
      />
    </>
  )
}

export default PlaceLiteOffer
