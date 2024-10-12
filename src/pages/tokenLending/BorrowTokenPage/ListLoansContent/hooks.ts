import { useEffect, useMemo, useState } from 'react'

import { CollateralToken } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'

import { DEFAULT_COLLATERAL_MINT } from '../InstantBorrowContent/hooks/constants'
import {
  useBorrowTokensList,
  useCollateralsList,
} from '../InstantBorrowContent/hooks/useCollateralsList'
import { BorrowToken } from '../constants'
import { getInputErrorMessage, getSummaryInfo } from './helpers'

export const MIN_APR_VALUE = 10
export const MAX_APR_VALUE = 140

export const useListLoansContent = () => {
  const { tokenType, setTokenType } = useTokenType()

  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<CollateralToken>()

  const [borrowInputValue, setBorrowlInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowToken>()

  const [inputAprValue, setInputAprValue] = useState('')
  const [inputFreezeValue, setInputFreezeValue] = useState('')

  const { collateralsList } = useCollateralsList()
  const { borrowTokensList } = useBorrowTokensList()

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

  const handleChangeFreezeValue = (value: string) => {
    return setInputFreezeValue(value)
  }

  const handleChangeAprValue = (value: string) => {
    return setInputAprValue(value)
  }

  const aprInputValueIsLow = parseFloat(inputAprValue) < MIN_APR_VALUE

  const lenderAprValue = !aprInputValueIsLow ? Math.round(parseFloat(inputAprValue) / 100) : 0

  const { ltvPercent, upfrontFee, weeklyFee } = getSummaryInfo({
    collateralAmount: parseFloat(collateralInputValue),
    borrowAmount: parseFloat(borrowInputValue),
    apr: parseFloat(inputAprValue),
    collateralToken,
    tokenType,
  })

  const errorMessage = getInputErrorMessage({
    collateralAmount: parseFloat(collateralInputValue),
    borrowAmount: parseFloat(borrowInputValue),
    freezeValue: parseFloat(inputFreezeValue),
    apr: parseFloat(inputAprValue),
  })

  return {
    collateralsList,
    borrowTokensList,

    borrowToken,
    setBorrowToken,
    borrowInputValue,
    setBorrowlInputValue,

    collateralToken,
    setCollateralToken,
    collateralInputValue,
    setCollateralInputValue,

    inputAprValue,
    inputFreezeValue,

    handleChangeFreezeValue,
    handleChangeAprValue,

    lenderAprValue,

    errorMessage,

    ltvPercent,
    upfrontFee,
    weeklyFee,
  }
}
