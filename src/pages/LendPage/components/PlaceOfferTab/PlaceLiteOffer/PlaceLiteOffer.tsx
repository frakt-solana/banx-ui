import { FC } from 'react'

import { InputErrorMessage } from '@banx/components/inputs'

import { BorrowerMessage, PlaceOfferFields } from '../components'
import { OfferParams } from '../hooks'
import { OfferSummary } from './components'
import { usePlaceLiteOffer } from './hooks'

import styles from './PlaceLiteOffer.module.less'

const PlaceLiteOffer: FC<OfferParams> = (offerParams) => {
  const {
    loanValue,
    loansAmount,
    onLoanValueChange,
    onLoanAmountChange,
    isEditMode,
    offerSize,
    optimisticOffer,
  } = offerParams

  const { marketApr, offerErrorMessage, showBorrowerMessage, loanToValuePercent } =
    usePlaceLiteOffer(offerParams)

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
        offer={optimisticOffer}
        isEditMode={isEditMode}
        offerSize={offerSize}
        marketAPR={marketApr}
        loanToValuePercent={loanToValuePercent}
      />
    </>
  )
}

export default PlaceLiteOffer
