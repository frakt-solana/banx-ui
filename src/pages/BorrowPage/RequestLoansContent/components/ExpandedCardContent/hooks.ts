import { useState } from 'react'

import { MarketPreview } from '@banx/api/core'
import { useTokenType } from '@banx/store'
import { getTokenDecimals } from '@banx/utils'

export const useRequestLoansForm = (market: MarketPreview) => {
  const [inputLoanValue, setInputLoanValue] = useState('')
  const [inputAprValue, setInputAprValue] = useState('')
  const [inputFreezeValue, setInputFreezeValue] = useState('')

  const { tokenType } = useTokenType()

  const tokenDecimals = getTokenDecimals(tokenType)

  const loanToValuePercent =
    (parseFloat(inputLoanValue) / (market.collectionFloor / tokenDecimals)) * 100

  return {
    inputLoanValue,
    inputAprValue,
    inputFreezeValue,

    setInputLoanValue,
    setInputAprValue,
    setInputFreezeValue,

    loanToValuePercent,
  }
}
