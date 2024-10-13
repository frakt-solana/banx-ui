import { useEffect, useMemo, useState } from 'react'

import { BN } from 'fbonds-core'

import { CollateralToken } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import { adjustTokenAmountWithUpfrontFee, bnToHuman, stringToBN, sumBNs } from '@banx/utils'

import { BorrowToken, DEFAULT_COLLATERAL_MINT } from '../../constants'
import { useBorrowTokensList, useCollateralsList } from '../../hooks'
import { getErrorMessage } from '../helpers'
import { useBorrowOffers } from './useBorrowOffers'
import { useBorrowOffersTransaction } from './useBorrowOffersTransaction'

export const useInstantBorrowContent = () => {
  const { tokenType, setTokenType } = useTokenType()

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
    setInputCollateralsAmount,
    ltvSliderValue,
    onChangeLtvSlider,
  } = useBorrowOffers(collateralToken, borrowToken)

  const collateralToSet = useMemo(() => {
    const [firstCollateral] = collateralsList

    return firstCollateral?.amountInWallet
      ? firstCollateral
      : collateralsList.find(({ collateral }) => collateral.mint === DEFAULT_COLLATERAL_MINT)
  }, [collateralsList])

  useEffect(() => {
    if (!collateralToken && collateralToSet) {
      setCollateralToken(collateralToSet)
    }
  }, [collateralToken, collateralToSet])

  useEffect(() => {
    const selectedBorrowToken = borrowTokensList.find(
      (token) => token.lendingTokenType === tokenType,
    )

    if (!selectedBorrowToken) return

    // Update collateral token only if it's the same token
    if (collateralToken?.collateral.mint === selectedBorrowToken.collateral.mint) {
      setCollateralToken(collateralToSet)
    }

    setBorrowToken(selectedBorrowToken)
  }, [borrowTokensList, tokenType, collateralToken, collateralToSet])

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

    const totalAmountToGet = sumBNs(offersInCart.map((offer) => new BN(offer.maxTokenToGet)))
    const adjustedAmountToGet = adjustTokenAmountWithUpfrontFee(totalAmountToGet)

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

  const canFundRequiredCollaterals = useMemo(() => {
    const maxCollateralsToFund = sumBNs(offers.map((offer) => new BN(offer.maxCollateralToReceive)))
    const collaterDecimals = collateralToken?.collateral.decimals || 0
    const requiredCollaterals = stringToBN(collateralInputValue, collaterDecimals)

    return maxCollateralsToFund.gt(requiredCollaterals)
  }, [offers, collateralInputValue, collateralToken])

  return {
    offers,
    offersInCart,
    isLoading: isLoadingOffers,

    canFundRequiredCollaterals,

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
