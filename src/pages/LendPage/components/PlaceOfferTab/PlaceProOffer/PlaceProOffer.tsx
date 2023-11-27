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
    onClaimOfferInterest,
    onRemoveOffer,
    offerErrorMessage,
  } = usePlaceProOffer(offerParams)

  return (
    <>
      <div className={styles.fields}>
        <NumericInputField
          label="Initial offer"
          value={loanValue}
          onChange={onLoanValueChange}
          className={styles.numericField}
          disabled={!connected}
        />
        <NumericInputField
          label="Delta"
          onChange={onDeltaValueChange}
          value={deltaValue}
          disabled={!connected}
        />
        <InputCounter
          label="Number of loans"
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
        onClaimOfferInterest={onClaimOfferInterest}
        onUpdateOffer={onUpdateOffer}
        onCreateOffer={onCreateOffer}
        onRemoveOffer={onRemoveOffer}
      />
    </>
  )
}

export default PlaceProOffer
