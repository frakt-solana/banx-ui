import { useEffect, useState } from 'react'

import { BN } from 'fbonds-core'

import { CollateralToken } from '@banx/api/tokens'
import { useTokenBalance } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { bnToHuman } from '@banx/utils'

import {
  BORROW_TOKENS_LIST,
  BorrowToken,
  DEFAULT_BORROW_TOKEN,
  DEFAULT_COLLATERAL_TOKEN,
} from '../../constants'
import { calculateTotalAmount, getErrorMessage } from '../helpers'
import { useBorrowSplTokenOffers } from './useBorrowSplTokenOffers'
import { useBorrowSplTokenTransaction } from './useBorrowSplTokenTransaction'

export const useInstantBorrowContent = () => {
  const { tokenType, setTokenType } = useNftTokenType()

  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<CollateralToken>(DEFAULT_COLLATERAL_TOKEN)

  const [borrowInputValue, setBorrowInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowToken>(DEFAULT_BORROW_TOKEN)

  const collateralTokenBalance = useTokenBalance(collateralToken.collateral.mint)
  const borrowTokenBalance = useTokenBalance(borrowToken.collateral.mint)

  const {
    data: offers,
    isLoading: isLoadingOffers,
    setMarketPubkey,
    setOutputTokenType,
    inputPutType,
    setInputPutType,
    handleAmountChange,
  } = useBorrowSplTokenOffers()

  const handleCollateralInputChange = (value: string) => {
    if (inputPutType !== 'input') {
      setInputPutType('input')
      setOutputTokenType(borrowToken.lendingTokenType)
    }

    setCollateralInputValue(value)
    handleAmountChange(value, collateralToken.collateral.decimals)
  }

  const handleBorrowInputChange = (value: string) => {
    if (inputPutType !== 'output') {
      setInputPutType('output')
      setOutputTokenType(borrowToken.lendingTokenType)
    }

    setBorrowInputValue(value)
    handleAmountChange(value, borrowToken.collateral.decimals)
  }

  const handleCollateralTokenChange = (token: CollateralToken) => {
    setCollateralToken(token)
    setMarketPubkey(token.marketPubkey || '')
  }

  const handleBorrowTokenChange = (token: BorrowToken) => {
    setBorrowToken(token)
    setOutputTokenType(token.lendingTokenType)
    setTokenType(token.lendingTokenType)
  }

  useEffect(() => {
    const token = BORROW_TOKENS_LIST.find((token) => token.lendingTokenType === tokenType)
    if (token) {
      setBorrowToken(token)
      setOutputTokenType(token.lendingTokenType)
    }
  }, [setOutputTokenType, tokenType])

  useEffect(() => {
    if (inputPutType === 'input') {
      const totalAmountToGet = calculateTotalAmount(offers, 'amountToGet')
      const totalAmountToGetStr = bnToHuman(
        totalAmountToGet,
        borrowToken.collateral.decimals,
      ).toString()

      if (totalAmountToGetStr !== borrowInputValue) {
        setBorrowInputValue(totalAmountToGetStr)
      }
    } else if (inputPutType === 'output') {
      const totalAmountToGive = calculateTotalAmount(offers, 'amountToGive')

      const totalAmountToGetStr = bnToHuman(
        totalAmountToGive,
        collateralToken.collateral.decimals,
      ).toString()

      if (totalAmountToGetStr !== collateralInputValue) {
        setCollateralInputValue(totalAmountToGetStr)
      }
    }
  }, [offers, borrowToken, borrowInputValue, collateralToken, collateralInputValue, inputPutType])

  const collateralTokenBalanceStr = bnToHuman(
    new BN(collateralTokenBalance),
    collateralToken.collateral.decimals,
  ).toString()

  const borrowTokenBalanceStr = bnToHuman(
    new BN(borrowTokenBalance),
    borrowToken.collateral.decimals,
  ).toString()

  const errorMessage = getErrorMessage({
    offers,
    isLoadingOffers,
    collateralToken,
    collateralInputValue,
    tokenWalletBalance: collateralTokenBalanceStr,
  })

  const { executeBorrow } = useBorrowSplTokenTransaction({
    collateral: collateralToken,
    collateralsToSend: parseFloat(collateralInputValue),
    splTokenOffers: offers,
  })

  return {
    offers,

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
  }
}
