import { useEffect, useState } from 'react'

import { BN } from 'fbonds-core'

import { CollateralToken } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { bnToHuman, stringToBN } from '@banx/utils'

import { BorrowToken, DEFAULT_COLLATERAL_MARKET_PUBKEY } from '../../constants'
import { adjustAmountWithUpfrontFee, getErrorMessage } from '../helpers'
import { BorrowInputType, useBorrowOffers } from './useBorrowOffers'
import { useBorrowOffersTransaction } from './useBorrowOffersTransaction'
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
    offersInCart,
    isLoading: isLoadingOffers,
    inputType,
    setInputType,
    setInputCollateralsAmount,
    ltvSliderValue,
    onChangeLtvSlider,
  } = useBorrowOffers(collateralToken, borrowToken)

  useEffect(() => {
    const foundToken = collateralsList.find(
      (token) => token.marketPubkey === DEFAULT_COLLATERAL_MARKET_PUBKEY,
    )

    if (!collateralToken && foundToken) {
      setCollateralToken(foundToken)
    }
  }, [collateralToken, collateralsList])

  useEffect(() => {
    const foundToken = borrowTokensList.find((token) => token.lendingTokenType === tokenType)

    if (foundToken) {
      setBorrowToken(foundToken)
    }
  }, [borrowTokensList, tokenType, borrowToken])

  const handleCollateralInputChange = (value: string) => {
    if (!borrowToken || !collateralToken) return

    if (inputType !== BorrowInputType.Input) {
      setInputType(BorrowInputType.Input)
    }

    setCollateralInputValue(value)
    setInputCollateralsAmount(value)
  }

  const handleBorrowInputChange = (value: string) => {
    if (!borrowToken) return

    if (inputType !== BorrowInputType.Output) {
      setInputType(BorrowInputType.Output)
    }

    setBorrowInputValue(value)

    const amountToGetStr = bnToHuman(
      adjustAmountWithUpfrontFee(stringToBN(value, borrowToken.collateral.decimals), 'output'),
      borrowToken.collateral.decimals,
    ).toString()

    setInputCollateralsAmount(amountToGetStr)
  }

  const handleCollateralTokenChange = (token: CollateralToken) => {
    setCollateralToken(token)
  }

  const handleBorrowTokenChange = (token: BorrowToken) => {
    setBorrowToken(token)
    setTokenType(token.lendingTokenType)
  }

  useEffect(() => {
    if (inputType === BorrowInputType.Input) {
      if (!borrowToken) return

      const totalAmountToGet = offersInCart.reduce(
        (acc, offer) => acc.add(new BN(offer.maxTokenToGet)),
        new BN(0),
      )

      const adjustedAmountToGet = adjustAmountWithUpfrontFee(
        totalAmountToGet,
        BorrowInputType.Input,
      )

      const totalAmountToGetStr = bnToHuman(
        adjustedAmountToGet,
        borrowToken.collateral.decimals,
      ).toString()

      if (totalAmountToGetStr !== borrowInputValue) {
        setBorrowInputValue(totalAmountToGetStr)
      }
    } else if (inputType === BorrowInputType.Output) {
      if (!collateralToken) return

      const totalAmountToGive = offersInCart.reduce(
        (acc, offer) => acc.add(new BN(offer.maxTokenToGet)),
        new BN(0),
      )

      const totalAmountToGetStr = bnToHuman(
        totalAmountToGive,
        collateralToken.collateral.decimals,
      ).toString()

      if (totalAmountToGetStr !== collateralInputValue) {
        setCollateralInputValue(totalAmountToGetStr)
      }
    }
  }, [
    offersInCart,
    borrowToken,
    borrowInputValue,
    collateralToken,
    collateralInputValue,
    inputType,
  ])

  const errorMessage = getErrorMessage({
    offers,
    isLoadingOffers,
    collateralToken,
    collateralInputValue,
    borrowInputValue,
  })

  const { borrow, isBorrowing } = useBorrowOffersTransaction(collateralToken)

  return {
    offers,
    offersInCart,
    isLoading: isLoadingOffers,

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

    ltvSliderValue,
    onChangeLtvSlider,
  }
}
