import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { useWalletModal } from '@banx/components/WalletModal'

import { useModal } from '@banx/store/common'

import { LoanValueSlider } from '../components'
import InputTokenSelect, { SkeletonInputTokenSelect } from '../components/InputTokenSelect'
import OrderBook from './OrderBook'
import { Summary, SummarySkeleton } from './Summary'
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

  const showSkeleton = !(
    !!collateralsList.length &&
    !!borrowTokensList.length &&
    !!collateralToken &&
    !!borrowToken
  )

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

  const disabledBorrowButton = (wallet.connected && !!errorMessage) || !parseFloat(borrowInputValue)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {showSkeleton ? (
          <SkeletonInputTokenSelect label="Collateral" showRightLabel />
        ) : (
          <InputTokenSelect
            label="Collateral"
            value={collateralInputValue}
            onChange={handleCollateralInputChange}
            selectedToken={collateralToken}
            onChangeToken={handleCollateralTokenChange}
            tokenList={collateralsList}
            className={styles.collateralInput}
            maxValue={collateralToken.amountInWallet}
            disabled={!wallet.connected}
            showControls={wallet.connected}
          />
        )}

        {showSkeleton ? (
          <SkeletonInputTokenSelect label="To borrow" />
        ) : (
          <InputTokenSelect
            label="To borrow"
            value={borrowInputValue}
            onChange={() => null}
            selectedToken={borrowToken}
            onChangeToken={handleBorrowTokenChange}
            tokenList={borrowTokensList}
            className={styles.borrowInput}
            disabled
          />
        )}

        <LoanValueSlider label="Max LTV" value={ltvSliderValue} onChange={onChangeLtvSlider} />

        {showSkeleton ? <SummarySkeleton /> : <Summary offers={offersInCart} />}

        <Button
          onClick={onSubmit}
          disabled={disabledBorrowButton}
          className={styles.borrowButton}
          loading={!errorMessage && (isBorrowing || isLoading)}
        >
          {getButtonActionText({
            isLoading: isBorrowing || isLoading,
            isWalletConnected: wallet.connected,
            errorMessage,
          })}
        </Button>
      </div>
      <OrderBook
        offers={offers}
        isLoading={isLoading}
        requiredCollateralsAmount={collateralInputValue}
        collateral={collateralToken}
      />
    </div>
  )
}

export default InstantBorrowContent
