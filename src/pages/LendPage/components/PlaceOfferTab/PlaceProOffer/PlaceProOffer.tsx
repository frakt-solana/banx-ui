import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { InputCounter, NumericInputField } from '@banx/components/inputs'

import { OrderBookMarketParams } from '../../ExpandableCardContent'
import { OfferSummary } from './components'
import { usePlaceOfferTab } from './hooks'

import styles from './PlaceProOffer.module.less'

const PlaceProOffer: FC<OrderBookMarketParams> = (props) => {
  const { connected } = useWallet()

  const { loansAmount, onLoanAmountChange, loanValue, onLoanValueChange } = usePlaceOfferTab({
    ...props,
  })

  return (
    <>
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

      <OfferSummary />
    </>
  )
}

export default PlaceProOffer
