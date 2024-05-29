import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useNftTokenType } from '@banx/store/nft'
import { getTokenUnit } from '@banx/utils'

import { NumericStepInput } from '../inputs'
import { ActionsButtons } from './components/ActionsButtons'
import { AdditionalSummary, MainSummary } from './components/Summary'
import { useTokenPlaceOffer } from './hooks/useTokenPlaceOffer'

import styles from './PlaceTokenOfferSection.module.less'

interface PlaceTokenOfferSectionProps {
  offerPubkey: string
  marketPubkey: string
  setOfferPubkey?: (offerPubkey: string) => void
}

const PlaceTokenOfferSection: FC<PlaceTokenOfferSectionProps> = (props) => {
  const { loanValueString, offerSizeString, onLoanValueChange, onOfferSizeChange } =
    useTokenPlaceOffer(props)

  const { tokenType } = useNftTokenType()
  const { connected } = useWallet()

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.fields}>
          <NumericStepInput
            label="Offer"
            value={loanValueString}
            onChange={onLoanValueChange}
            postfix={getTokenUnit(tokenType)}
            disabled={!connected}
            step={1}
          />
          <NumericStepInput
            label="Size"
            value={offerSizeString}
            onChange={onOfferSizeChange}
            postfix={getTokenUnit(tokenType)}
            disabled={!connected}
            step={1}
          />
        </div>
        <MainSummary />
        <AdditionalSummary offerSize={parseFloat(offerSizeString)} />

        <ActionsButtons
          onCreateOffer={() => null}
          onRemoveOffer={() => null}
          onUpdateOffer={() => null}
          disablePlaceOffer={false}
          disableUpdateOffer={false}
          isEditMode={false}
        />
      </div>
    </div>
  )
}

export default PlaceTokenOfferSection
