import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { InputCounter, InputErrorMessage, NumericInputField } from '@banx/components/inputs'

import { BorrowerMessage } from '../components'
import { PlaceOfferParams } from '../hooks'
import { ActionsButtons, Diagram, Summary } from './components'

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
  isProMode,
  offerSize,
  market,
  diagramData,
  isLoadingDiagram,
}) => {
  const { connected } = useWallet()

  const isEditMode = syntheticOffer.isEdit
  const showBorrowerMessage = !offerErrorMessage && !!offerSize
  const disablePlaceOffer = !!offerErrorMessage || !offerSize
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !offerSize

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
        {isProMode && (
          <NumericInputField
            label="Avg Delta"
            onChange={onDeltaValueChange}
            value={deltaValue}
            disabled={!connected}
            tooltipText={DELTA_TOOLTIP_TEXT}
          />
        )}
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
      <Diagram marks={diagramData} isLoading={isLoadingDiagram} />
      <Summary
        offer={optimisticOffer}
        isEditMode={isEditMode}
        offerSize={offerSize}
        market={market}
        loansQuantity={parseFloat(loansAmount)}
        isProMode={isProMode}
        hasFormChanges={hasFormChanges}
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

const DELTA_TOOLTIP_TEXT =
  'The average difference between loans taken from this pool given 100% utilization. For example: initialOffer: 1 SOL, delta 0.2 SOL, number of offers 2. The loans can be either the max 1, 0.8; or 0.2, 0.4, 0.4, 0,6, 0.1, 0.1. In both cases the average delta is 0.2. And the sum of loans is same'
