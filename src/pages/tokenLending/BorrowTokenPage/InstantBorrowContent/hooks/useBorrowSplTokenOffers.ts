import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
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
  const { publicKey } = useWallet()
  const walletPubkeyString = publicKey?.toString() || ''

  const [inputType, setInputType] = useState<'input' | 'output'>('input')
  const [amount, setAmount] = useState('')

  const debouncedAmount = useDebounceValue(amount, 1000)

  const tokenDecimals =
    inputType === 'input' ? collateralToken?.collateral.decimals : borrowToken?.collateral.decimals

  const { data, isLoading } = useQuery(
    [
      'borrowSplTokenOffers',
      {
        collateralToken,
        borrowToken,
        type: inputType,
        amount: debouncedAmount,
        walletPubkeyString,
      },
    ],
    () =>
      core.fetchBorrowSplTokenOffers({
        market: collateralToken?.marketPubkey ?? '',
        outputToken: borrowToken?.lendingTokenType ?? LendingTokenType.BanxSol,
        type: inputType,
        amount: stringToHex(debouncedAmount, tokenDecimals),
        walletPubkey: walletPubkeyString,
      }),
    {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      enabled: !!parseFloat(amount) && !!collateralToken,
    },
  )

  return {
    data: data ?? [],
    isLoading,

    inputType,
    setInputType,
    setAmount,
  }
}
