import { useEffect, useMemo, useState } from 'react'

import { BN } from 'fbonds-core'

import { CollateralToken } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { bnToHuman, getTokenDecimals, stringToBN, sumBNs } from '@banx/utils'

import { BorrowToken, DEFAULT_COLLATERAL_MARKET_PUBKEY } from '../../constants'
import { adjustAmountWithUpfrontFee, getErrorMessage } from '../helpers'
import { useBorrowOffers } from './useBorrowOffers'
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

  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const {
    data: offers,
    offersInCart,
    isLoading: isLoadingOffers,
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

    setCollateralInputValue(value)
    setInputCollateralsAmount(value)
  }

  const handleCollateralTokenChange = (token: CollateralToken) => {
    setCollateralToken(token)
  }

  const handleBorrowTokenChange = (token: BorrowToken) => {
    setBorrowToken(token)
    setTokenType(token.lendingTokenType)
  }

  useEffect(() => {
    if (!borrowToken) return

    const totalAmountToGet = offersInCart.reduce(
      (acc, offer) => acc.add(new BN(offer.maxTokenToGet)),
      new BN(0),
    )

    const adjustedAmountToGet = adjustAmountWithUpfrontFee(totalAmountToGet)

    const totalAmountToGetStr = bnToHuman(
      adjustedAmountToGet,
      borrowToken.collateral.decimals,
    ).toString()

    if (totalAmountToGetStr !== borrowInputValue) {
      setBorrowInputValue(totalAmountToGetStr)
    }
  }, [offersInCart, borrowToken, borrowInputValue, collateralToken, collateralInputValue])

  const errorMessage = getErrorMessage({
    offers,
    isLoadingOffers,
    collateralToken,
    collateralInputValue,
    borrowInputValue,
  })

  const { borrow, isBorrowing } = useBorrowOffersTransaction(collateralToken)

  const canFundAllCollaterals = useMemo(() => {
    const totalMaxCollateralToFund = sumBNs(
      offers.map((offer) => new BN(offer.maxCollateralToReceive)),
    )

    const requiredCollateral = stringToBN(collateralInputValue, marketTokenDecimals)

    return totalMaxCollateralToFund.gt(requiredCollateral)
  }, [offers, collateralInputValue, marketTokenDecimals])

  return {
    offers,
    offersInCart,
    isLoading: isLoadingOffers,

    canFundAllCollaterals,

    collateralsList,
    borrowTokensList,

    collateralInputValue,
    collateralToken,
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
  }
}
