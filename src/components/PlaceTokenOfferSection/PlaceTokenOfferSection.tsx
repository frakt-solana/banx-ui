import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useModal } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenUnit } from '@banx/utils'

import { Button } from '../Buttons'
import { DisplayValue } from '../TableComponents'
import { InputErrorMessage, NumericStepInput } from '../inputs'
import { Modal } from '../modals/BaseModal'
import { ActionsButtons } from './components/ActionsButtons'
import OrderBook from './components/OrderBook'
import { AdditionalSummary, MainSummary } from './components/Summary'
import { useTokenPlaceOffer } from './hooks/useTokenPlaceOffer'

import styles from './PlaceTokenOfferSection.module.less'

interface PlaceTokenOfferSectionProps {
  marketPubkey: string
  offerPubkey?: string
}

const PlaceTokenOfferSection: FC<PlaceTokenOfferSectionProps> = (props) => {
  const {
    isEditMode,
    loanValueString,
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
  } = useTokenPlaceOffer(props)

  const { tokenType } = useNftTokenType()
  const { connected } = useWallet()

  const { open } = useModal()

  const showModal = () => {
    open(OffersModal, { props })
  }

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

        <div className={styles.messageContainer}>
          {offerErrorMessage && <InputErrorMessage message={offerErrorMessage} />}
          {showBorrowerMessage && <BorrowerMessage />}
        </div>

        <MainSummary />
        <AdditionalSummary offerSize={parseFloat(offerSizeString)} />

        <ActionsButtons
          onCreateOffer={onCreateTokenOffer}
          onRemoveOffer={onRemoveTokenOffer}
          onUpdateOffer={onUpdateTokenOffer}
          disablePlaceOffer={disablePlaceOffer}
          disableUpdateOffer={disableUpdateOffer}
          isEditMode={isEditMode}
        />
      </div>
      <OrderBook
        marketPubkey={props.marketPubkey}
        offerPubkey={props.offerPubkey}
        className={styles.orderBook}
      />
    </div>
  )
}

export default PlaceTokenOfferSection

interface OffersModalProps {
  marketPubkey: string
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
