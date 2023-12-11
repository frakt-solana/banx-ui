import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { InputCounter, InputErrorMessage, NumericInputField } from '@banx/components/inputs'

import { BorrowerMessage, OfferActionButtons } from '../components'
import { OfferParams } from '../hooks'
import { OfferSummary } from './components'
import { usePlaceProOffer } from './hooks'

import styles from './PlaceProOffer.module.less'

const PlaceProOffer: FC<OfferParams> = (offerParams) => {
  const { connected } = useWallet()

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
      <div className={styles.fields}>
        <NumericInputField
          label="Max offer"
          value={loanValue}
          onChange={onLoanValueChange}
          className={styles.numericField}
          disabled={!connected}
        />
        <NumericInputField
          label="Avg Delta"
          onChange={onDeltaValueChange}
          value={deltaValue}
          disabled={!connected}
          tooltipText="The average difference between loans taken from this pool given 100% utilization. For example: initialOffer: 1 SOL, delta 0.2 SOL, number of offers 2. The loans can be either the max 1, 0.8; or 0.2, 0.4, 0.4, 0,6, 0.1, 0.1. In both cases the average delta is 0.2. And the sum of loans is same"
        />
        <InputCounter
          label="Number of offers"
          onChange={onLoanAmountChange}
          value={loansAmount}
          disabled={!connected}
        />
      </div>
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
