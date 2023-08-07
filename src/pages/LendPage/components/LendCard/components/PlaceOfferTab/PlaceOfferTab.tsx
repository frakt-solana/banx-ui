import { RadioButtonField } from '@banx/components/RadioButton'
import InputCounter from '@banx/components/inputs/InputCounter'

import { OfferActionButtons, OfferHeader, OfferSummary } from './components'
import { DEFAULTS_OPTIONS } from './constants'
import { usePlaceOfferTab } from './hooks'

import styles from './PlaceOfferTab.module.less'

const PlaceOfferTab = () => {
  const { bondFeature, onBondFeatureChange, loansAmountInput, onLoanAmountChange } =
    usePlaceOfferTab()

  return (
    <div className={styles.content}>
      <OfferHeader />
      <div className={styles.radiobuttonsWrapper}>
        <RadioButtonField
          tooltipText="When funding full loans, lenders have the option to get defaulted NFTs instead of the SOL recovered from the liquidation"
          label="If full loan liquidated"
          currentOption={{
            label: `${bondFeature}`,
            value: bondFeature as any,
          }}
          className={styles.radio}
          onOptionChange={onBondFeatureChange as any}
          options={DEFAULTS_OPTIONS}
          classNameInner={styles.radioButton}
        />
      </div>
      <div className={styles.fields}>
        {/* <NumericInputField label="Offer" {...loanValueInputParams} hasError={showDepositError} /> */}
        <InputCounter
          label="Number of loans"
          onChange={onLoanAmountChange}
          value={loansAmountInput}
        />
      </div>
      {/* <InputErrorMessage hasError={showDepositError} message="Not enough SOL" /> */}
      <OfferSummary />
      <OfferActionButtons />
    </div>
  )
}

export default PlaceOfferTab
