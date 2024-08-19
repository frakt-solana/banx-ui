import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { LoanValueSlider, Separator } from '../components'
import InputTokenSelect, { SkeletonInputTokenSelect } from '../components/InputTokenSelect'
import OrderBook from './OrderBook'
import { Summary, SummarySkeleton } from './Summary'
import { getButtonActionText } from './helpers'
import { useInstantBorrowContent } from './hooks/useInstantBorrowContent'

import styles from './InstantBorrowContent.module.less'

const InstantBorrowContent = () => {
  const wallet = useWallet()

  const {
    offers,
    offersInCart,
    isLoading,

    collateralsList,
    borrowTokensList,

    collateralToken,
    collateralInputValue,
    handleCollateralInputChange,
    handleCollateralTokenChange,

    borrowToken,
    borrowInputValue,
    handleBorrowTokenChange,

    errorMessage,
    borrow,
    isBorrowing,

    ltvSliderValue,
    onChangeLtvSlider,
  } = useInstantBorrowContent()

  const showSkeleton = !(
    !!collateralsList.length &&
    !!borrowTokensList.length &&
    !!collateralToken &&
    !!borrowToken
  )

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {showSkeleton ? (
          <SkeletonInputTokenSelect label="Collateralize" showRightLabel />
        ) : (
          <InputTokenSelect
            label="Collateralize"
            value={collateralInputValue}
            onChange={handleCollateralInputChange}
            selectedToken={collateralToken}
            onChangeToken={handleCollateralTokenChange}
            tokenList={collateralsList}
            className={styles.collateralInput}
            maxValue={collateralToken.amountInWallet}
            disabledInput={!wallet.connected}
            showControls={wallet.connected}
          />
        )}

        <Separator />

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
            disabledInput
          />
        )}

        <LoanValueSlider label="Max LTV" value={ltvSliderValue} onChange={onChangeLtvSlider} />

        {showSkeleton ? <SummarySkeleton /> : <Summary offers={offersInCart} />}

        <Button
          onClick={borrow}
          disabled={!wallet.connected || !!errorMessage}
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
        maxCollateralAmount={parseFloat(collateralInputValue)}
        collateral={collateralToken}
      />
    </div>
  )
}

export default InstantBorrowContent