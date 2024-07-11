import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { Separator } from '../components'
import InputTokenSelect from '../components/InputTokenSelect'
import { Summary } from './Summary'
import { useBorrowTokensList, useCollateralsList } from './hooks/useCollateralsList'
import { useInstantBorrowContent } from './hooks/useInstantBorrowContent'

import styles from './InstantBorrowContent.module.less'

const InstantBorrowContent = () => {
  const wallet = useWallet()

  const {
    offers,
    collateralToken,
    collateralInputValue,
    handleCollateralInputChange,
    handleCollateralTokenChange,

    borrowToken,
    borrowInputValue,
    handleBorrowInputChange,
    handleBorrowTokenChange,

    collateralTokenBalanceStr,
    borrowTokenBalanceStr,

    errorMessage,
    borrow,
    isBorrowing,
  } = useInstantBorrowContent()

  const { collateralsList } = useCollateralsList()
  const { borrowTokensList } = useBorrowTokensList()

  return (
    <div className={styles.content}>
      <InputTokenSelect
        label="Collateralize"
        value={collateralInputValue}
        onChange={handleCollateralInputChange}
        selectedToken={collateralToken}
        onChangeToken={handleCollateralTokenChange}
        tokenList={collateralsList}
        className={styles.collateralInput}
        maxValue={collateralTokenBalanceStr}
        disabledInput={!wallet.connected}
      />

      <Separator />

      <InputTokenSelect
        label="To borrow"
        value={borrowInputValue}
        onChange={handleBorrowInputChange}
        selectedToken={borrowToken}
        onChangeToken={handleBorrowTokenChange}
        tokenList={borrowTokensList}
        className={styles.borrowInput}
        maxValue={borrowTokenBalanceStr}
        disabledInput={!wallet.connected}
      />

      <Summary collateralToken={collateralToken} offers={offers} />
      <Button
        onClick={borrow}
        disabled={!wallet.connected || !!errorMessage}
        className={styles.borrowButton}
        loading={isBorrowing}
      >
        {!wallet.connected ? 'Connect wallet' : errorMessage || 'Borrow'}
      </Button>
    </div>
  )
}

export default InstantBorrowContent
