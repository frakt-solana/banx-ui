import { FC, useEffect, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { useTokenBalance } from '@banx/hooks'
import { bnToHuman, stringToHex } from '@banx/utils'

import { Separator } from '../components'
import InputTokenSelect from '../components/InputTokenSelect'
import {
  BORROW_MOCK_TOKENS_LIST,
  BorrowCollateral,
  COLLATERAL_TOKENS_LIST,
  DEFAULT_COLLATERAL_TOKEN,
  MOCK_APR_RATE,
} from '../constants'
import { calculateTotalAmountToGet, getErrorMessage } from './helpers'
import { useBorrowSplTokenTransaction } from './hooks'
import { useBorrowSplTokenOffers } from './hooks/useBorrowSplTokenOffers'

import styles from './InstantBorrowContent.module.less'

const InstantBorrowContent = () => {
  const wallet = useWallet()

  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<BorrowCollateral>(DEFAULT_COLLATERAL_TOKEN)

  const [borrowInputValue, setBorrowInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowCollateral>(BORROW_MOCK_TOKENS_LIST[0])

  const collateralTokenBalance = useTokenBalance(collateralToken.meta.mint)
  const borrowTokenBalance = useTokenBalance(borrowToken.meta.mint)

  const {
    data: splTokenOffers,
    setMarketPubkey,
    setOutputTokenTicker,
    setType,
    setAmount,
    type,
  } = useBorrowSplTokenOffers({
    marketPubkey: DEFAULT_COLLATERAL_TOKEN.marketPubkey,
    outputTokenTicker: BORROW_MOCK_TOKENS_LIST[0].meta.ticker,
  })

  const handleSelectCollateralToken = (token: BorrowCollateral) => {
    setCollateralToken(token)
    setMarketPubkey(token.marketPubkey || '')
  }

  const handleCollateralInputChange = (value: string) => {
    setType('input')
    setCollateralInputValue(value)
    setOutputTokenTicker(borrowToken.meta.ticker)
    setAmount(stringToHex(value, collateralToken.meta.decimals))
  }

  const handleBorrowInputChange = (value: string) => {
    setType('output')
    setBorrowInputValue(value)
    setOutputTokenTicker(collateralToken.meta.ticker)
    setAmount(stringToHex(value, borrowToken.meta.decimals))
  }

  const handleSelectBorrowToken = (token: BorrowCollateral) => {
    setBorrowToken(token)
    setOutputTokenTicker(token.meta.ticker)
  }

  useEffect(() => {
    const totalAmountToGet = calculateTotalAmountToGet(splTokenOffers)
    const totalAmountToGetString = totalAmountToGet.toString()

    if (type === 'input' && totalAmountToGetString !== borrowInputValue) {
      setBorrowInputValue(totalAmountToGetString)
    } else if (type === 'output' && totalAmountToGetString !== collateralInputValue) {
      setCollateralInputValue(totalAmountToGetString)
    }
  }, [splTokenOffers, borrowInputValue, type, collateralInputValue])

  const formattedCollateralTokenBalance = bnToHuman(
    new BN(collateralTokenBalance),
    collateralToken.meta.decimals,
  ).toString()

  const formattedBorrowTokenBalance = bnToHuman(
    new BN(borrowTokenBalance),
    borrowToken.meta.decimals,
  ).toString()

  const errorMessage = getErrorMessage({
    collateral: collateralToken,
    collaretalInputValue: collateralInputValue,
    maxTokenValue: formattedCollateralTokenBalance,
  })

  const { executeBorrow } = useBorrowSplTokenTransaction(collateralToken, splTokenOffers)

  return (
    <div className={styles.content}>
      <InputTokenSelect
        label="Collateralize"
        value={collateralInputValue}
        onChange={handleCollateralInputChange}
        selectedToken={collateralToken}
        onChangeToken={handleSelectCollateralToken}
        tokenList={COLLATERAL_TOKENS_LIST}
        className={styles.collateralInput}
        maxValue={formattedCollateralTokenBalance}
        decimals={collateralToken.meta.decimals}
        disabledInput={!wallet.connected}
      />

      <Separator />

      <InputTokenSelect
        label="To borrow"
        value={borrowInputValue}
        onChange={handleBorrowInputChange}
        selectedToken={borrowToken}
        onChangeToken={handleSelectBorrowToken}
        tokenList={BORROW_MOCK_TOKENS_LIST}
        className={styles.borrowInput}
        maxValue={formattedBorrowTokenBalance}
        decimals={borrowToken.meta.decimals}
        disabledInput={!wallet.connected}
      />

      <Summary apr={MOCK_APR_RATE} upfrontFee={0.001} weeklyInterest={0.01} />
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
  apr: number
  upfrontFee: number
  weeklyInterest: number
}

export const Summary: FC<SummaryProps> = ({ apr, upfrontFee, weeklyInterest }) => {
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
        value={<DisplayValue value={weeklyInterest} />}
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="APR"
        value={apr / 100}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={statClassNames}
        flexType="row"
      />
    </div>
  )
}
