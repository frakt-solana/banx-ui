import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { InputCounter, NumericInputField } from '@banx/components/inputs'

import { OrderBookMarketParams } from '../../ExpandableCardContent'
import { OfferActionButtons } from '../components'
import { OfferSummary } from './components'
import { usePlaceOfferTab } from './hooks'

import styles from './PlaceProOffer.module.less'

const PlaceProOffer: FC<OrderBookMarketParams> = (props) => {
  const { connected } = useWallet()

  const {
    isEditMode,
    loansAmount,
    loanValue,
    deltaValue,
    onLoanAmountChange,
    onDeltaValueChange,
    onLoanValueChange,
    offerTransactions,
    offerSize,
    marketApr,
    disablePlaceOffer,
    disableUpdateOffer,
  } = usePlaceOfferTab(props)

  return (
    <>
      <div className={styles.fields}>
        <NumericInputField
          label="Initial offer"
          value={loanValue}
          onChange={onLoanValueChange}
          className={styles.numericField}
          disabled={!connected}
          hasError
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
      <OfferSummary offerSize={offerSize} marketApr={marketApr} />
      <OfferActionButtons
        isEditMode={isEditMode}
        disableUpdateOffer={disableUpdateOffer}
        disablePlaceOffer={disablePlaceOffer}
        {...offerTransactions}
      />
    </>
  )
}

export default PlaceProOffer
