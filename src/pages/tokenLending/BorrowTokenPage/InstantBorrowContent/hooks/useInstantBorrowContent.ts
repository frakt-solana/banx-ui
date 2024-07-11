import { useEffect, useState } from 'react'

import { CollateralToken } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { bnToHuman } from '@banx/utils'

import { BorrowToken, DEFAULT_COLLATERAL_MARKET_PUBKEY } from '../../constants'
import { calculateTotalAmount, getErrorMessage } from '../helpers'
import { useBorrowSplTokenOffers } from './useBorrowSplTokenOffers'
import { useBorrowSplTokenTransaction } from './useBorrowSplTokenTransaction'
import { useBorrowTokensList, useCollateralsList } from './useCollateralsList'

export const useInstantBorrowContent = () => {
  const { tokenType, setTokenType } = useNftTokenType()

  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<CollateralToken>()

  const [borrowInputValue, setBorrowInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowToken>()

  const { collateralsList } = useCollateralsList()
  const { borrowTokensList } = useBorrowTokensList()

  const {
    data: offers,
    isLoading: isLoadingOffers,
    setMarketPubkey,
    setOutputTokenType,
    inputPutType,
    setInputPutType,
    handleAmountChange,
  } = useBorrowSplTokenOffers()

  useEffect(() => {
    const foundToken = collateralsList.find(
      (token) => token.marketPubkey === DEFAULT_COLLATERAL_MARKET_PUBKEY,
    )

    if (!collateralToken && foundToken) {
      setCollateralToken(foundToken)
      setMarketPubkey(foundToken.marketPubkey)
    }
  }, [collateralToken, collateralsList, setMarketPubkey])

  useEffect(() => {
    const foundToken = borrowTokensList.find((token) => token.lendingTokenType === tokenType)

    if (foundToken) {
      setBorrowToken(foundToken)
      setOutputTokenType(foundToken.lendingTokenType)
    }
  }, [borrowTokensList, tokenType, borrowToken, setOutputTokenType])

  const handleCollateralInputChange = (value: string) => {
    if (!borrowToken || !collateralToken) return

    if (inputPutType !== 'input') {
      setInputPutType('input')
      setOutputTokenType(borrowToken.lendingTokenType)
    }

    setCollateralInputValue(value)
    handleAmountChange(value, collateralToken.collateral.decimals)
  }

  const handleBorrowInputChange = (value: string) => {
    if (!borrowToken) return

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
    if (inputPutType === 'input') {
      if (!borrowToken) return

      const totalAmountToGet = calculateTotalAmount(offers, 'amountToGet')
      const totalAmountToGetStr = bnToHuman(
        totalAmountToGet,
        borrowToken.collateral.decimals,
      ).toString()

      if (totalAmountToGetStr !== borrowInputValue) {
        setBorrowInputValue(totalAmountToGetStr)
      }
    } else if (inputPutType === 'output') {
      if (!collateralToken) return

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

  const errorMessage = getErrorMessage({
    offers,
    isLoadingOffers,
    collateralToken,
    collateralInputValue,
    borrowInputValue,
  })

  const { borrow, isBorrowing } = useBorrowSplTokenTransaction({
    collateral: collateralToken,
    collateralsToSend: parseFloat(collateralInputValue),
    splTokenOffers: offers,
  })

  return {
    offers,
    collateralsList,
    borrowTokensList,

    collateralInputValue,
    collateralToken,
    handleCollateralInputChange,
    handleCollateralTokenChange,

    borrowToken,
    borrowInputValue,
    handleBorrowInputChange,
    handleBorrowTokenChange,

    borrow,
    isBorrowing,
    errorMessage,
  }
}
