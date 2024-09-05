import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { useWalletModal } from '@banx/components/WalletModal'

import { useModal } from '@banx/store/common'

import { LoanValueSlider } from '../components'
import InputTokenSelect from '../components/InputTokenSelect'
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

        <LoanValueSlider label="Max LTV" value={ltvSliderValue} onChange={onChangeLtvSlider} />

        <Summary offers={offersInCart} />

        <Button
          onClick={onSubmit}
          className={styles.borrowButton}
          disabled={wallet.connected && (!!errorMessage || !offersInCart.length)}
          loading={!errorMessage && (isBorrowing || isLoading)}
        >
          {getButtonActionText({ isWalletConnected: wallet.connected, errorMessage })}
        </Button>
      </div>
      <OrderBook
        offers={offers}
        isLoading={isLoading}
        requiredCollateralsAmount={collateralInputValue}
        collateral={collateralToken}
        errorMessage={errorMessage}
      />
    </div>
  )
}

export default InstantBorrowContent
