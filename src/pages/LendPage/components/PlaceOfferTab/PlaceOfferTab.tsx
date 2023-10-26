import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { InputCounter, NumericInputField } from '@banx/components/inputs'

import { OrderBookMarketParams } from '../ExpandableCardContent'
import { OfferActionButtons, OfferHeader, OfferMessages, OfferSummary } from './components'
import { usePlaceOfferTab } from './hooks'

import styles from './PlaceOfferTab.module.less'

const PlaceOfferTab: FC<OrderBookMarketParams> = (props) => {
  const { connected } = useWallet()

  const {
    isEditMode,
    exitEditMode,
    loansAmount,
    onLoanAmountChange,
    loanValue,
    onLoanValueChange,
    offerTransactions,
    offerSize,
    marketApr,
    showDepositError,
    showBorrowerMessage,
    disableUpdateOffer,
    disablePlaceOffer,
    loanToValuePercent,
  } = usePlaceOfferTab({ ...props })

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={isEditMode} exitEditMode={exitEditMode} />
      <div className={styles.fields}>
        <NumericInputField
          label="Offer"
          value={loanValue}
          onChange={onLoanValueChange}
          className={styles.numericField}
          disabled={!connected}
          hasError
        />
        <InputCounter
          label="Number of loans"
          onChange={onLoanAmountChange}
          value={loansAmount}
          disabled={!connected}
        />
      </div>
      <OfferMessages
        showDepositErrorMessage={showDepositError}
        showBorrowerMessage={showBorrowerMessage}
        loanValue={loanValue}
      />
      <OfferSummary
        offerSize={offerSize}
        marketAPR={marketApr}
        loanToValuePercent={loanToValuePercent}
      />
      <OfferActionButtons
        isEditMode={isEditMode}
        disableUpdateOffer={disableUpdateOffer}
        disablePlaceOffer={disablePlaceOffer}
        {...offerTransactions}
      />
    </div>
  )
}

export default PlaceOfferTab
