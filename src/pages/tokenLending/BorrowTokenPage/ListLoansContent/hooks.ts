import { useState } from 'react'

import { clamp } from 'lodash'

import { BONDS, DAYS_IN_YEAR } from '@banx/constants'

import { BORROW_MOCK_TOKENS_LIST, BorrowToken, COLLATERAL_TOKENS_LIST } from '../constants'

export const MIN_APR_VALUE = 10
export const MAX_APR_VALUE = 140

export const useListLoansContent = () => {
  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<BorrowToken>(COLLATERAL_TOKENS_LIST[0])

  const [borrowInputValue, setBorrowlInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowToken>(BORROW_MOCK_TOKENS_LIST[0])

  const [sliderValue, setSliderValue] = useState(100)
  const [inputAprValue, setInputAprValue] = useState('')
  const [inputFreezeValue, setInputFreezeValue] = useState('')

  const handleChangeFreezeValue = (value: string) => {
    const clampedValue = clampInputValue(value, DAYS_IN_YEAR)
    return setInputFreezeValue(clampedValue)
  }

  const handleChangeAprValue = (value: string) => {
    const clampedValue = clampInputValue(value, MAX_APR_VALUE)
    return setInputAprValue(clampedValue)
  }

  const aprInputValueIsLow = parseFloat(inputAprValue) < MIN_APR_VALUE

  const lenderSeesAprValue = !aprInputValueIsLow
    ? Math.round(parseFloat(inputAprValue) - BONDS.PROTOCOL_REPAY_FEE / 100)
    : 0

  return {
    borrowToken,
    setBorrowToken,
    borrowInputValue,
    setBorrowlInputValue,

    collateralToken,
    setCollateralToken,
    collateralInputValue,
    setCollateralInputValue,

    sliderValue,
    inputAprValue,
    inputFreezeValue,

    setSliderValue,
    handleChangeFreezeValue,
    handleChangeAprValue,

    lenderSeesAprValue,
  }
}

const clampInputValue = (value: string, max: number): string => {
  if (!value) return ''

  const valueToNumber = parseFloat(value)
  const clampedValue = clamp(valueToNumber, 0, max)
  return clampedValue.toString()
}
