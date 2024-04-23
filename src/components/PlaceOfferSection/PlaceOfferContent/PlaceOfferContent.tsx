import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { InputErrorMessage, NumericStepInput } from '@banx/components/inputs'

import { useTokenType } from '@banx/store'
import { getTokenUnit, isSolTokenType } from '@banx/utils'

import { BorrowerMessage } from '../components'
import { PlaceOfferParams } from '../hooks'
import { ActionsButtons, AdditionalSummary, MainSummary } from './components'

import styles from './PlaceOfferContent.module.less'

const PlaceOfferContent: FC<PlaceOfferParams> = ({
  loanValue,
  loansAmount,
  deltaValue,
  onLoanValueChange,
  onLoanAmountChange,
  onDeltaValueChange,
  onCreateOffer,
  onRemoveOffer,
  onUpdateOffer,
  optimisticOffer,
  syntheticOffer,
  offerErrorMessage,
  hasFormChanges,
  offerSize,
  market,
  updatedOffer,
}) => {
  const { tokenType } = useTokenType()
  const { connected } = useWallet()

  const isEditMode = syntheticOffer.isEdit
  const showBorrowerMessage = !offerErrorMessage && !!offerSize
  const disablePlaceOffer = !!offerErrorMessage || !offerSize
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !offerSize

  const inputStepByTokenType = isSolTokenType(tokenType) ? 0.1 : 1

  return (
    <>
      <div className={styles.fields}>
        <NumericStepInput
          label="Max offer"
          value={loanValue}
          onChange={onLoanValueChange}
          className={styles.maxOfferInput}
          disabled={!connected}
          tooltipText="Your max offer, given sufficient liquidity in your offer. Actual loan amount taken can be less depending on the amount of SOL borrowers choose to borrow"
          postfix={getTokenUnit(tokenType)}
          step={inputStepByTokenType}
        />
        <NumericStepInput
          label="Number of offers"
          onChange={onLoanAmountChange}
          value={loansAmount}
          disabled={!connected}
          className={styles.offersAmountInput}
          step={1}
        />
        <NumericStepInput
          label="Decrease by"
          onChange={onDeltaValueChange}
          value={deltaValue}
          disabled={!connected}
          className={styles.deltaInput}
          tooltipText="Max Offer will decrease by this amount every time a borrower takes your max offer (AKA “delta”)"
          postfix={getTokenUnit(tokenType)}
          step={inputStepByTokenType}
        />
      </div>
      <div className={styles.messageContainer}>
        {offerErrorMessage && <InputErrorMessage message={offerErrorMessage} />}
        {showBorrowerMessage && <BorrowerMessage loanValue={loanValue} tokenType={tokenType} />}
      </div>

      <MainSummary
        hasFormChanges={hasFormChanges}
        initialOffer={optimisticOffer}
        updatedOffer={updatedOffer}
        market={market}
      />

      <AdditionalSummary
        hasFormChanges={hasFormChanges}
        initialOffer={optimisticOffer}
        updatedOffer={updatedOffer}
      />

      <ActionsButtons
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

export default PlaceOfferContent
