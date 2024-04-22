import { useEffect, useMemo, useState } from 'react'

import { MarketPreview } from '@banx/api/core'
import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { useTokenType } from '@banx/store'
import { convertToHumanNumber, getTokenDecimals } from '@banx/utils'

import { useSelectedNfts } from '../../nftsState'
import { DEFAULT_FREEZE_VALUE } from './constants'
import { calculateSummaryInfo } from './helpers'

export const useRequestLoansForm = (market: MarketPreview) => {
  const { nfts, isLoading: isLoadingNfts, maxLoanValueByMarket } = useBorrowNfts()
  const { selection: selectedNfts, set: setSelection } = useSelectedNfts()
  const { tokenType } = useTokenType()

  const [inputLoanValue, setInputLoanValue] = useState('')
  const [inputAprValue, setInputAprValue] = useState('')
  const [inputFreezeValue, setInputFreezeValue] = useState('')

  const totalNftsToRequest = selectedNfts.length
  const tokenDecimals = getTokenDecimals(tokenType)

  const filteredNfts = useMemo(() => {
    return nfts.filter((nft) => nft.loan.marketPubkey === market.marketPubkey)
  }, [nfts, market])

  const handleNftsSelection = (value = 0) => {
    setSelection(filteredNfts.slice(0, value))
  }

  useEffect(() => {
    const maxLoanValue = maxLoanValueByMarket[market.marketPubkey]
    if (!maxLoanValue) return

    const convertedMaxLoanValue = convertToHumanNumber(maxLoanValue, tokenType)
    const roundedAprValueInPercent = (market.marketApr / 100)?.toFixed(0)

    setInputLoanValue(String(convertedMaxLoanValue))
    setInputAprValue(roundedAprValueInPercent)
    setInputFreezeValue(String(DEFAULT_FREEZE_VALUE))
  }, [market, maxLoanValueByMarket, tokenType])

  const inputLoanValueToNumber = parseFloat(inputLoanValue)
  const requestedLoanValue = inputLoanValueToNumber * tokenDecimals

  const { ltv, upfrontFee, weeklyInterest } = calculateSummaryInfo({
    requestedLoanValue,
    inputAprValue,
    totalNftsToRequest,
    collectionFloor: market.collectionFloor,
  })

  return {
    inputLoanValue,
    inputAprValue,
    inputFreezeValue,

    setInputLoanValue,
    setInputAprValue,
    setInputFreezeValue,
    handleNftsSelection,

    requestedLoanValue,
    totalNftsToRequest,

    nfts: filteredNfts,
    isLoadingNfts,

    ltv,
    upfrontFee,
    weeklyInterest,

    tokenType,
  }
}
