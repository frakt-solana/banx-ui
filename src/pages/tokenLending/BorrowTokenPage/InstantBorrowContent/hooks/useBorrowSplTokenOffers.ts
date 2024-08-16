import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { getBondingCurveTypeFromLendingToken } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { CollateralToken, core } from '@banx/api/tokens'
import { useDebounceValue } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { BorrowToken } from '../../constants'

export const useBorrowSplTokenOffers = (
  collateralToken: CollateralToken | undefined,
  borrowToken: BorrowToken | undefined,
) => {
  const { publicKey } = useWallet()
  const walletPubkeyString = publicKey?.toString() || ''

  const [inputType, setInputType] = useState<'input' | 'output'>('input')
  const [amount, setAmount] = useState('')
  const [ltvSliderValue, setLtvSlider] = useState(100)

  const { tokenType } = useNftTokenType()

  const debouncedAmount = useDebounceValue(amount, 1000)
  const debouncedLtvSliderValue = useDebounceValue(ltvSliderValue, 1000)

  const tokenDecimals = getTokenDecimals(tokenType) //? 1e9, 1e6

  const { data, isLoading } = useQuery(
    [
      'borrowSplTokenOffers',
      {
        collateralToken,
        borrowToken,
        type: inputType,
        debouncedAmount,
        debouncedLtvSliderValue,
        walletPubkeyString,
      },
    ],
    () =>
      core.fetchBorrowOffers({
        market: collateralToken?.marketPubkey ?? '',
        bondingCurveType: getBondingCurveTypeFromLendingToken(tokenType),
        ltvLimit: debouncedLtvSliderValue * 100,
        collateralsAmount: parseFloat(debouncedAmount) * tokenDecimals,
        excludeWallet: walletPubkeyString,
        disableMultiBorrow: false,
      }),
    {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      enabled: !!parseFloat(amount) && !!collateralToken,
    },
  )

  const onChangeLtvSlider = (value: number) => {
    setLtvSlider(value)
  }

  return {
    data: data ?? [],
    isLoading,

    inputType,
    setInputType,
    setAmount,
    ltvSliderValue,
    onChangeLtvSlider,
  }
}
