import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { BorrowSplTokenOffers, CollateralToken } from '@banx/api/tokens'

import { Separator } from '../components'
import InputTokenSelect from '../components/InputTokenSelect'
import { getSummaryInfo } from './helpers'
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
    executeBorrow,
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
        onClick={executeBorrow}
        disabled={!wallet.connected || !!errorMessage}
        className={styles.borrowButton}
      >
        {!wallet.connected ? 'Connect wallet' : errorMessage || 'Borrow'}
      </Button>
    </div>
  )
}

export default InstantBorrowContent

interface SummaryProps {
  offers: BorrowSplTokenOffers[]
  collateralToken: CollateralToken
}

export const Summary: FC<SummaryProps> = ({ offers, collateralToken }) => {
  const { upfrontFee, weightedApr, weeklyFee } = getSummaryInfo(offers, collateralToken)

  const statClassNames = {
    value: styles.fixedStatValue,
  }

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Upfront fee"
        value={<DisplayValue value={upfrontFee} />}
        tooltipText="1% upfront fee charged on the loan principal amount, paid when loan is funded"
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="Est weekly fee"
        value={<DisplayValue value={weeklyFee} />}
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="Weighted APR"
        value={weightedApr / 100}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={statClassNames}
        flexType="row"
      />
    </div>
  )
}
