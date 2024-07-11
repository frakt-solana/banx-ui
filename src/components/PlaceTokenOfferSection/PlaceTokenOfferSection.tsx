import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { TokenMarketPreview } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenUnit, isBanxSolTokenType } from '@banx/utils'

import { Button } from '../Buttons'
import { DisplayValue } from '../TableComponents'
import { InputErrorMessage, NumericStepInput } from '../inputs'
import { Modal } from '../modals/BaseModal'
import { ActionsButtons } from './components/ActionsButtons'
import OrderBook from './components/OrderBook'
import { AdditionalSummary, MainSummary } from './components/Summary'
import { usePlaceTokenOffer } from './hooks/usePlaceTokenOffer'

import styles from './PlaceTokenOfferSection.module.less'

interface PlaceTokenOfferSectionProps {
  marketPubkey: string
  offerPubkey?: string
}

const PlaceTokenOfferSection: FC<PlaceTokenOfferSectionProps> = ({
  marketPubkey,
  offerPubkey = '',
}) => {
  const {
    isEditMode,
    market,
    collateralsPerTokenString,
    offerSizeString,
    onLoanValueChange,
    onOfferSizeChange,
    offerErrorMessage,
    showBorrowerMessage,
    onCreateTokenOffer,
    onUpdateTokenOffer,
    onRemoveTokenOffer,
    disablePlaceOffer,
    disableUpdateOffer,
  } = usePlaceTokenOffer(marketPubkey, offerPubkey)

  const { tokenType } = useNftTokenType()
  const { connected } = useWallet()

  const { open } = useModal()

  const showModal = () => {
    open(OffersModal, { market, offerPubkey })
  }

  const inputStepByTokenType = isBanxSolTokenType(tokenType) ? 0.1 : 1

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <Button
          className={styles.showOffersMobileButton}
          onClick={showModal}
          type="circle"
          variant="text"
        >
          See offers
        </Button>

        <div className={styles.fields}>
          <NumericStepInput
            label="Offer"
            value={collateralsPerTokenString}
            onChange={onLoanValueChange}
            postfix={getTokenUnit(tokenType)}
            disabled={!connected}
            step={inputStepByTokenType}
          />
          <NumericStepInput
            label="Size"
            value={offerSizeString}
            onChange={onOfferSizeChange}
            postfix={getTokenUnit(tokenType)}
            disabled={!connected}
            step={inputStepByTokenType}
          />
        </div>

        <div className={styles.messageContainer}>
          {offerErrorMessage && <InputErrorMessage message={offerErrorMessage} />}
          {showBorrowerMessage && <BorrowerMessage />}
        </div>

        <MainSummary market={market} collateralPerToken={parseFloat(collateralsPerTokenString)} />
        <AdditionalSummary
          market={market}
          collateralPerToken={parseFloat(collateralsPerTokenString)}
          offerSize={parseFloat(offerSizeString)}
        />

        <ActionsButtons
          onCreateOffer={onCreateTokenOffer}
          onRemoveOffer={onRemoveTokenOffer}
          onUpdateOffer={onUpdateTokenOffer}
          disablePlaceOffer={disablePlaceOffer}
          disableUpdateOffer={disableUpdateOffer}
          isEditMode={isEditMode}
        />
      </div>
      <OrderBook market={market} offerPubkey={offerPubkey} className={styles.orderBook} />
    </div>
  )
}

export default PlaceTokenOfferSection

interface OffersModalProps {
  market: TokenMarketPreview | undefined
  offerPubkey: string
}

export const OffersModal: FC<OffersModalProps> = (props) => {
  const { close } = useModal()

  return (
    <Modal className={styles.modal} open onCancel={close}>
      <OrderBook {...props} />
    </Modal>
  )
}

const BorrowerMessage = () => {
  return <p className={styles.borrowerMessage}>Borrower sees: {<DisplayValue value={0} />}</p>
}
