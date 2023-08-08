import { FC } from 'react'

import { RadioButtonField } from '@banx/components/RadioButton'
import { InputCounter, NumericInputField } from '@banx/components/inputs'

import { OfferActionButtons, OfferHeader, OfferSummary } from './components'
import { DEFAULTS_OPTIONS } from './constants'
import { usePlaceOfferTab } from './hooks'

import styles from './PlaceOfferTab.module.less'

const PlaceOfferTab: FC<{ marketPubkey: string }> = ({ marketPubkey }) => {
  const {
    isEdit,
    goToPlaceOffer,
    bondFeature,
    onBondFeatureChange,
    loansAmountInput,
    onLoanAmountChange,
    loanValueInput,
    onLoanValueChange,
  } = usePlaceOfferTab(marketPubkey)

  return (
    <div className={styles.content}>
      <OfferHeader isEdit={isEdit} goToPlaceOffer={goToPlaceOffer} />
      <RadioButtonField
        tooltipText="When funding full loans, lenders have the option to get defaulted NFTs instead of the SOL recovered from the liquidation"
        label="If full loan liquidated"
        currentOption={{
          label: bondFeature,
          value: bondFeature,
        }}
        onOptionChange={onBondFeatureChange}
        options={DEFAULTS_OPTIONS}
      />
      <div className={styles.fields}>
        <NumericInputField
          label="Offer"
          value={loanValueInput}
          onChange={onLoanValueChange}
          className={styles.numericField}
        />
        <InputCounter
          label="Number of loans"
          onChange={onLoanAmountChange}
          value={loansAmountInput}
        />
      </div>
      <OfferSummary />
      <OfferActionButtons />
    </div>
  )
}

export default PlaceOfferTab
