import { FC } from 'react'

import { InputErrorMessage } from '@banx/components/inputs'

import { BorrowerMessage, OfferActionButtons, PlaceOfferFields } from '../components'
import { OfferParams } from '../hooks'
import { OfferSummary } from './components'

import styles from './PlaceProOffer.module.less'

const PlaceProOffer: FC<OfferParams> = (offerParams) => {
  const {
    loanValue,
    loansAmount,
    deltaValue,
    onLoanValueChange,
    onLoanAmountChange,
    onDeltaValueChange,
    onCreateOffer,
    onRemoveOffer,
    onUpdateOffer,
    isEditMode,
    offerSize,
    offerErrorMessage,
    hasFormChanges,
    marketPreview,
    optimisticOffer,
  } = offerParams

  const showBorrowerMessage = !offerErrorMessage && !!offerSize
  const disablePlaceOffer = !!offerErrorMessage || !offerSize
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !offerSize

  return (
    <>
      <PlaceOfferFields
        loanValue={loanValue}
        deltaValue={deltaValue}
        loansAmount={loansAmount}
        onLoanAmountChange={onLoanAmountChange}
        onDeltaValueChange={onDeltaValueChange}
        onLoanValueChange={onLoanValueChange}
      />
      <div className={styles.messageContainer}>
        {offerErrorMessage && <InputErrorMessage message={offerErrorMessage} />}
        {showBorrowerMessage && <BorrowerMessage loanValue={loanValue} />}
      </div>
      <OfferSummary
        offer={optimisticOffer}
        isEditMode={isEditMode}
        offerSize={offerSize}
        market={marketPreview}
        loansAmount={parseFloat(loansAmount)}
      />
      <OfferActionButtons
        isEditMode={isEditMode}
        disableUpdateOffer={disableUpdateOffer}
        disablePlaceOffer={disablePlaceOffer}
        onUpdateOffer={onUpdateOffer}
        onCreateOffer={onCreateOffer}
        onRemoveOffer={onRemoveOffer}
      />
    </>
  )
}

export default PlaceProOffer
