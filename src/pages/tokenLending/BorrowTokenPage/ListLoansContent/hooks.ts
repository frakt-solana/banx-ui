import { useState } from 'react'

import { clamp } from 'lodash'

import { CollateralToken } from '@banx/api/tokens'
import { BONDS, DAYS_IN_YEAR } from '@banx/constants'

import { BORROW_TOKENS_LIST, BorrowToken } from '../constants'

export const MIN_APR_VALUE = 10
export const MAX_APR_VALUE = 140

export const DEFAULT_COLLATERAL_TOKEN = {
  marketPubkey: '9vMKEMq8G36yrkqVUzQuAweieCsxU9ZaK1ob8GRegwmh',
  collateral: {
    mint: 'BANXbTpN8U2cU41FjPxe2Ti37PiT5cCxLUKDQZuJeMMR',
    ticker: 'BANX',
    logoUrl: 'https://arweave.net/5QRitQGPVjPwpjt43Qe_WISmys4dWwLMqQqQDT0oshg',
    decimals: 9,
    priceUsd: 0,
    totalSupply: 0,
    FDV: 0,
  },
  collateralPrice: 0,
  amountInWallet: 0,
}

export const useListLoansContent = () => {
  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<CollateralToken>(DEFAULT_COLLATERAL_TOKEN)

  const [borrowInputValue, setBorrowlInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowToken>(BORROW_TOKENS_LIST[0])

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
