import { FC } from 'react'

import { InputErrorMessage } from '@banx/components/inputs'

import { BorrowerMessage, OfferActionButtons, PlaceOfferFields } from '../components'
import { OfferParams } from '../hooks'
import { OfferSummary } from './components'
import { usePlaceProOffer } from './hooks'

import styles from './PlaceProOffer.module.less'

const PlaceProOffer: FC<OfferParams> = (offerParams) => {
  const {
    isEditMode,
    offerSize,
    loansAmount,
    loanValue,
    deltaValue,
    onLoanAmountChange,
    onDeltaValueChange,
    onLoanValueChange,
    disablePlaceOffer,
    disableUpdateOffer,
    showBorrowerMessage,
    onCreateOffer,
    onUpdateOffer,
    onRemoveOffer,
    offerErrorMessage,
  } = usePlaceProOffer(offerParams)

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
        offer={offerParams.optimisticOffer}
        isEditMode={isEditMode}
        offerSize={offerSize}
        market={offerParams.marketPreview}
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
