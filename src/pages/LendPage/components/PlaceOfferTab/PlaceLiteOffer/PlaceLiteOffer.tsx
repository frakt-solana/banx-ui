import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { InputCounter, InputErrorMessage, NumericInputField } from '@banx/components/inputs'

import { BorrowerMessage, OfferActionButtons } from '../components'
import { OfferParams } from '../hooks'
import { OfferSummary } from './components'
import { usePlaceLiteOffer } from './hooks'

import styles from './PlaceLiteOffer.module.less'

const PlaceLiteOffer: FC<OfferParams> = (offersParams) => {
  const { connected } = useWallet()

  const {
    isEditMode,
    loansAmount,
    onLoanAmountChange,
    loanValue,
    onLoanValueChange,
    onClaimOfferInterest,
    disableClaimInterest,
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
      <div className={styles.fields}>
        <NumericInputField
          label="Offer"
          value={loanValue}
          onChange={onLoanValueChange}
          className={styles.numericField}
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
        disableClaimInterest={disableClaimInterest}
        onClaimOfferInterest={onClaimOfferInterest}
        onCreateOffer={onCreateOffer}
        onRemoveOffer={onRemoveOffer}
        onUpdateOffer={onUpdateOffer}
      />
    </>
  )
}

export default PlaceLiteOffer
