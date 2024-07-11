import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { BN } from 'bn.js'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { core } from '@banx/api/tokens'
import { useDebounceValue } from '@banx/hooks'
import { ZERO_BN, stringToHex } from '@banx/utils'

export const useBorrowSplTokenOffers = () => {
  const [marketPubkey, setMarketPubkey] = useState('')
  const [outputTokenType, setOutputTokenType] = useState<LendingTokenType>()
  const [inputPutType, setInputPutType] = useState<'input' | 'output'>('input')
  const [amount, setAmount] = useState('')

  const debouncedAmount = useDebounceValue(amount, 1000)

  const { data, isLoading } = useQuery(
    [
      'borrowSplTokenOffers',
      { marketPubkey, outputTokenType, type: inputPutType, amount: debouncedAmount },
    ],
    () =>
      core.fetchBorrowSplTokenOffers({
        market: marketPubkey,
        outputToken: outputTokenType ?? LendingTokenType.BanxSol,
        type: inputPutType,
        amount: debouncedAmount,
      }),
    {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      enabled: new BN(debouncedAmount, 'hex').gt(ZERO_BN) && !!marketPubkey,
    },
  )

  const handleAmountChange = (value: string, decimals: number) => {
    setAmount(stringToHex(value, decimals))
  }

  return {
    data: data ?? [],
    isLoading,

    inputPutType,
    setMarketPubkey,
    setOutputTokenType,
    setInputPutType,

    handleAmountChange,
  }
}
