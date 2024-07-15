import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { CollateralToken, core } from '@banx/api/tokens'
import { useDebounceValue } from '@banx/hooks'
import { stringToHex } from '@banx/utils'

import { BorrowToken } from '../../constants'

export const useBorrowSplTokenOffers = (
  collateralToken: CollateralToken | undefined,
  borrowToken: BorrowToken | undefined,
) => {
  const [inputPutType, setInputPutType] = useState<'input' | 'output'>('input')
  const [amount, setAmount] = useState('')

  const debouncedAmount = useDebounceValue(amount, 1000)

  const { data, isLoading } = useQuery(
    [
      'borrowSplTokenOffers',
      { collateralToken, borrowToken, type: inputPutType, amount: debouncedAmount },
    ],
    () =>
      core.fetchBorrowSplTokenOffers({
        market: collateralToken?.marketPubkey ?? '',
        outputToken: borrowToken?.lendingTokenType ?? LendingTokenType.BanxSol,
        type: inputPutType,
        amount: stringToHex(debouncedAmount, getDecimals()),
      }),
    {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      enabled: !!parseFloat(amount) && !!collateralToken,
    },
  )

  const getDecimals = () => {
    if (inputPutType === 'input') {
      return collateralToken?.collateral.decimals
    }

    return borrowToken?.collateral.decimals
  }

  return {
    data: data ?? [],
    isLoading,

    inputPutType,
    setInputPutType,
    setAmount,
  }
}
