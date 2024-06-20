import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { BN } from 'bn.js'

import { core } from '@banx/api/tokens'
import { useDebounceValue } from '@banx/hooks'
import { ZERO_BN } from '@banx/utils'

export const useBorrowSplTokenOffers = (initialProps?: {
  marketPubkey?: string
  outputTokenTicker?: string
}) => {
  const [marketPubkey, setMarketPubkey] = useState(initialProps?.marketPubkey || '')
  const [outputTokenTicker, setOutputTokenTicker] = useState(initialProps?.outputTokenTicker || '')
  const [type, setType] = useState<'input' | 'output'>('input')
  const [amount, setAmount] = useState('')

  const debouncedAmount = useDebounceValue(amount, 1000)

  const { data, isLoading } = useQuery(
    ['borrowSplTokenOffers', { marketPubkey, outputTokenTicker, type, amount: debouncedAmount }],
    () =>
      core.fetchBorrowSplTokenOffers({
        market: marketPubkey,
        outputToken: outputTokenTicker,
        type,
        amount: debouncedAmount,
      }),
    {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      enabled: new BN(debouncedAmount, 'hex').gt(ZERO_BN) && !!marketPubkey,
    },
  )

  return {
    data: data ?? [],
    isLoading,

    type,

    setMarketPubkey,
    setOutputTokenTicker,
    setAmount,
    setType,
  }
}
