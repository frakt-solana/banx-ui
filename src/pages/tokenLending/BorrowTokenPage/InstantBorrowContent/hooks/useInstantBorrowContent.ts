import { useEffect, useMemo, useState } from 'react'

import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'

import { CollateralToken } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import {
  adjustTokenAmountWithUpfrontFee,
  bnToHuman,
  limitDecimalPlaces,
  stringToBN,
  sumBNs,
} from '@banx/utils'

import { BorrowToken } from '../../constants'
import { useBorrowTokensList, useCollateralsList } from '../../hooks'
import { getErrorMessage } from '../helpers'
import { useBorrowOffers } from './useBorrowOffers'
import { useBorrowOffersTransaction } from './useBorrowOffersTransaction'
import { useSelectedOffers } from './useSelectedOffers'

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
    isLoading: isLoadingOffers,
    ltvSliderValue,
    onChangeLtvSlider,
  } = useBorrowOffers({ collateralToken, borrowToken, collateralInputValue })

  useEffect(() => {
    if (!collateralToken) return

    const collateralTokenDecimals = collateralToken.collateral.decimals || 0
    const amountInWallet = collateralToken.amountInWallet / Math.pow(10, collateralTokenDecimals)

    setCollateralInputValue(limitDecimalPlaces(amountInWallet.toString()))
  }, [collateralToken])

  const collateralToSet = useMemo(() => {
    const [firstCollateral] = collateralsList

    return firstCollateral?.amountInWallet
      ? firstCollateral
      : collateralsList.find(({ collateral }) => collateral.mint === BANX_TOKEN_MINT.toBase58())
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
  }

  const handleCollateralTokenChange = (token: CollateralToken) => {
    setCollateralToken(token)
  }

  const handleBorrowTokenChange = (token: BorrowToken) => {
    setBorrowToken(token)
    setTokenType(token.lendingTokenType)
  }

  const { selection: selectedOffers } = useSelectedOffers()

  useEffect(() => {
    if (!borrowToken) return

    const totalAmountToGet = sumBNs(selectedOffers.map((offer) => new BN(offer.maxTokenToGet)))
    const adjustedAmountToGet = adjustTokenAmountWithUpfrontFee(totalAmountToGet)

    const totalAmountToGetStr = bnToHuman(
      adjustedAmountToGet,
      borrowToken.collateral.decimals,
    ).toString()

    if (totalAmountToGetStr !== borrowInputValue) {
      setBorrowInputValue(totalAmountToGetStr)
    }
  }, [selectedOffers, borrowToken, borrowInputValue, collateralToken, collateralInputValue])

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
    selectedOffers,
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
