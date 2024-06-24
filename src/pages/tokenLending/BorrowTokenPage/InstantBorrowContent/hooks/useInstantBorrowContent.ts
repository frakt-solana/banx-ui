import { useEffect, useState } from 'react'

import { BN } from 'fbonds-core'
import { SECONDS_IN_DAY } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { BONDS } from '@banx/constants'
import { useTokenBalance } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { bnToHuman } from '@banx/utils'

import {
  BORROW_TOKENS_LIST,
  BorrowToken,
  DEFAULT_BORROW_TOKEN,
  DEFAULT_COLLATERAL_TOKEN,
  MOCK_APR_RATE,
} from '../../constants'
import { calculateAmountToGet, calculateAmountToGive, getErrorMessage } from '../helpers'
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
    outputTokenType: DEFAULT_BORROW_TOKEN.outputToken,
  })

  const handleCollateralInputChange = (value: string) => {
    if (inputPutType !== 'input') {
      setInputPutType('input')
      setOutputTokenType(borrowToken.outputToken)
    }

    setCollateralInputValue(value)
    handleAmountChange(value, collateralToken.meta.decimals)
  }

  const handleBorrowInputChange = (value: string) => {
    if (inputPutType !== 'output') {
      setInputPutType('output')
      setOutputTokenType(borrowToken.outputToken)
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
    setOutputTokenType(token.outputToken)
    setTokenType(token.lendingTokenType)
  }

  useEffect(() => {
    const token = BORROW_TOKENS_LIST.find((token) => token.lendingTokenType === tokenType)
    if (token) {
      setBorrowToken(token)
      setOutputTokenType(token.outputToken)
    }
  }, [setOutputTokenType, tokenType])

  useEffect(() => {
    if (inputPutType === 'input') {
      const totalAmountToGet = calculateAmountToGet(splTokenOffers)
      const totalAmountToGetStr = bnToHuman(totalAmountToGet, borrowToken.meta.decimals).toString()

      if (totalAmountToGetStr !== borrowInputValue) {
        setBorrowInputValue(totalAmountToGetStr)
      }
    } else if (inputPutType === 'output') {
      const totalAmountToGive = calculateAmountToGive(splTokenOffers)

      const totalAmountToGetStr = bnToHuman(
        totalAmountToGive,
        collateralToken.meta.decimals,
      ).toString()

      if (totalAmountToGetStr !== collateralInputValue) {
        setCollateralInputValue(totalAmountToGetStr)
      }
    }
  }, [
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

  const totalAmountToGet = calculateAmountToGet(splTokenOffers)
  const upfrontFee = totalAmountToGet.div(new BN(100)).toNumber()
  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: totalAmountToGet.toNumber(),
    startTime: moment().unix(),
    currentTime: moment().unix() + SECONDS_IN_DAY * 7,
    rateBasePoints: MOCK_APR_RATE + BONDS.PROTOCOL_REPAY_FEE,
  })

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
    weeklyFee,
  }
}
