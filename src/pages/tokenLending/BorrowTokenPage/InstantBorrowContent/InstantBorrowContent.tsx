import { useWallet } from '@solana/wallet-adapter-react'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { useWalletModal } from '@banx/components/WalletModal'

import { useModal } from '@banx/store/common'

import { LoanValueSlider } from '../components'
import InputTokenSelect from '../components/InputTokenSelect'
import MarketOrderBook from './MarketOrderBook'
import OrderBook from './OrderBook'
import { Summary } from './Summary'
import WarningModal from './WarningModal'
import { getButtonActionText } from './helpers'
import { useInstantBorrowContent } from './hooks/useInstantBorrowContent'

import styles from './InstantBorrowContent.module.less'

const InstantBorrowContent = () => {
  const wallet = useWallet()

  const {
    offers,
    offersInCart,
    isLoading,

    canFundRequiredCollaterals,

    collateralsList,
    borrowTokensList,

    collateralToken,
    collateralInputValue,
    handleCollateralInputChange,
    handleCollateralTokenChange,

    borrowToken,
    borrowInputValue,
    handleBorrowTokenChange,

    borrow,
    isBorrowing,
    errorMessage,

    ltvSliderValue,
    onChangeLtvSlider,
  } = useInstantBorrowContent()

  const { open: openModal, close: closeModal } = useModal()
  const { setVisible } = useWalletModal()

  const onSubmit = () => {
    if (!wallet.connected) {
      return setVisible(true)
    }

    if (canFundRequiredCollaterals) {
      return borrow()
    }

    return openModal(WarningModal, {
      offers: offersInCart,
      collateral: collateralToken,
      onSubmit: borrow,
      onCancel: closeModal,
    })
  }

  const loading = isLoading && !!parseFloat(collateralInputValue)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <InputTokenSelect
          label="Your collateral"
          value={collateralInputValue}
          onChange={handleCollateralInputChange}
          selectedToken={collateralToken}
          onChangeToken={handleCollateralTokenChange}
          tokensList={collateralsList}
          className={styles.collateralInput}
          maxValue={collateralToken?.amountInWallet}
          showControls={wallet.connected}
        />

        <InputTokenSelect
          label="To borrow"
          value={borrowInputValue}
          onChange={() => null}
          selectedToken={borrowToken}
          onChangeToken={handleBorrowTokenChange}
          tokensList={borrowTokensList}
          className={styles.borrowInput}
          disabled
        />

        <LoanValueSlider
          label="LTV"
          value={ltvSliderValue}
          onChange={onChangeLtvSlider}
          disabled={!parseFloat(collateralInputValue)}
        />

        <div className={styles.footerContent}>
          <Summary
            offers={offersInCart}
            marketPubkey={collateralToken?.marketPubkey ?? PUBKEY_PLACEHOLDER}
          />

          <Button
            onClick={onSubmit}
            className={styles.borrowButton}
            disabled={wallet.connected && (!!errorMessage || !offersInCart.length)}
            loading={!errorMessage && (isBorrowing || loading)}
          >
            {getButtonActionText({ isWalletConnected: wallet.connected, errorMessage })}
          </Button>
        </div>
      </div>

      <div className={styles.orderBookContainer}>
        {loading && <Loader className={styles.loader} />}

        {!loading && !offers.length && !!collateralToken && (
          <MarketOrderBook collateral={collateralToken} />
        )}

        {!loading && !!offers.length && (
          <OrderBook
            offers={offers}
            requiredCollateralsAmount={collateralInputValue}
            collateral={collateralToken}
          />
        )}
      </div>
    </div>
  )
}

export default InstantBorrowContent
