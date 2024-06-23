import { useEffect, useMemo, useState } from 'react'

import { BN } from 'fbonds-core'

import { useTokenBalance } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { bnToHuman } from '@banx/utils'

import {
  BORROW_TOKENS_LIST,
  BorrowToken,
  DEFAULT_BORROW_TOKEN,
  DEFAULT_COLLATERAL_TOKEN,
} from '../../constants'
import { getErrorMessage } from '../helpers'
import { useBorrowSplTokenOffers } from './useBorrowSplTokenOffers'
import { useBorrowSplTokenTransaction } from './useBorrowSplTokenTransaction'

export const useInstantBorrowContent = () => {
  const { tokenType, setTokenType } = useNftTokenType()

  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<BorrowToken>(DEFAULT_COLLATERAL_TOKEN)

  const [borrowInputValue, setBorrowInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowToken>(DEFAULT_BORROW_TOKEN)

  const collateralTokenBalance = useTokenBalance(collateralToken.meta.mint)
  const borrowTokenBalance = useTokenBalance(borrowToken.meta.mint)

  const {
    data: splTokenOffers,
    isLoading: isLoadingSplTokenOffers,
    setMarketPubkey,
    setOutputTokenType,
    inputPutType,
    setInputPutType,

    handleAmountChange,
  } = useBorrowSplTokenOffers({
    marketPubkey: DEFAULT_COLLATERAL_TOKEN.marketPubkey,
    outputTokenType: DEFAULT_BORROW_TOKEN.meta.ticker,
  })

  const handleCollateralInputChange = (value: string) => {
    if (inputPutType !== 'input') {
      setInputPutType('input')
      setOutputTokenType(borrowToken.meta.ticker)
    }

    setCollateralInputValue(value)
    handleAmountChange(value, collateralToken.meta.decimals)
  }

  const handleBorrowInputChange = (value: string) => {
    if (inputPutType !== 'output') {
      setInputPutType('output')
      setOutputTokenType(collateralToken.meta.ticker)
    }

    setBorrowInputValue(value)
    handleAmountChange(value, borrowToken.meta.decimals)
  }

  const handleCollateralTokenChange = (token: BorrowToken) => {
    setCollateralToken(token)
    setMarketPubkey(token.marketPubkey || '')
  }

  const handleBorrowTokenChange = (token: BorrowToken) => {
    setBorrowToken(token)
    setOutputTokenType(token.meta.ticker)
    setTokenType(token.lendingTokenType)
  }

  useEffect(() => {
    const token = BORROW_TOKENS_LIST.find((token) => token.lendingTokenType === tokenType)
    if (token) {
      setBorrowToken(token)
      setOutputTokenType(token.meta.ticker)
    }
  }, [setOutputTokenType, tokenType])

  const totalAmountToGet = useMemo(() => {
    return splTokenOffers.reduce((acc, offer) => {
      return acc.add(new BN(offer.amountToGet, 'hex'))
    }, new BN(0))
  }, [splTokenOffers])

  useEffect(() => {
    if (inputPutType === 'input') {
      const decimals = borrowToken.meta.decimals
      const totalAmountToGetStr = bnToHuman(totalAmountToGet, decimals).toString()

      if (totalAmountToGetStr !== borrowInputValue) {
        setBorrowInputValue(totalAmountToGetStr)
      }
    } else if (inputPutType === 'output') {
      const decimals = collateralToken.meta.decimals
      const totalAmountToGetStr = bnToHuman(totalAmountToGet, decimals).toString()

      if (totalAmountToGetStr !== collateralInputValue) {
        setCollateralInputValue(totalAmountToGetStr)
      }
    }
  }, [
    totalAmountToGet,
    splTokenOffers,
    borrowToken,
    borrowInputValue,
    collateralToken,
    collateralInputValue,
    inputPutType,
  ])

  const collateralTokenBalanceStr = bnToHuman(
    new BN(collateralTokenBalance),
    collateralToken.meta.decimals,
  ).toString()

  const borrowTokenBalanceStr = bnToHuman(
    new BN(borrowTokenBalance),
    borrowToken.meta.decimals,
  ).toString()

  const errorMessage = getErrorMessage({
    collateral: collateralToken,
    collaretalInputValue: collateralInputValue,
    maxTokenValue: collateralTokenBalanceStr,
    offersExist: !!splTokenOffers.length && !isLoadingSplTokenOffers,
  })

  const { executeBorrow } = useBorrowSplTokenTransaction(collateralToken, splTokenOffers)

  const upfrontFee = totalAmountToGet.div(new BN(100)).toNumber()

  return {
    collateralInputValue,
    collateralToken,
    handleCollateralInputChange,
    handleCollateralTokenChange,

    borrowToken,
    borrowInputValue,
    handleBorrowInputChange,
    handleBorrowTokenChange,

    collateralTokenBalanceStr,
    borrowTokenBalanceStr,

    executeBorrow,
    errorMessage,

    upfrontFee,
  }
}
