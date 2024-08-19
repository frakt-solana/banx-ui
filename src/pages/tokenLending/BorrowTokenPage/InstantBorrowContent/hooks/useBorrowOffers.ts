import { useEffect, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { getBondingCurveTypeFromLendingToken } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { CollateralToken, core } from '@banx/api/tokens'
import { useDebounceValue } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { BorrowToken } from '../../constants'
import { getUpdatedBorrowOffers } from '../OrderBook/helpers'
import { useSelectedOffers } from './useSelectedOffers'

export const useBorrowOffers = (
  collateralToken: CollateralToken | undefined,
  borrowToken: BorrowToken | undefined,
) => {
  const { publicKey } = useWallet()
  const walletPubkeyString = publicKey?.toString() || ''

  const [inputCollateralsAmount, setInputCollateralsAmount] = useState('')
  const [ltvSliderValue, setLtvSlider] = useState(100)

  const { tokenType } = useNftTokenType()

  const debouncedCollateralsAmount = useDebounceValue(inputCollateralsAmount, 1000)
  const debouncedLtvSliderValue = useDebounceValue(ltvSliderValue, 1000)

  const marketTokenDecimals = getTokenDecimals(tokenType) //? 1e9, 1e6

  const queryKey = [
    'borrowOffers',
    {
      collateralToken,
      borrowToken,
      debouncedCollateralsAmount,
      debouncedLtvSliderValue,
      walletPubkeyString,
    },
  ]

  const fetchBorrowOffers = () => {
    const marketPubkey = collateralToken?.marketPubkey || ''
    const bondingCurveType = getBondingCurveTypeFromLendingToken(tokenType)
    const collateralsAmount = parseFloat(debouncedCollateralsAmount) * marketTokenDecimals

    const ltvLimit = debouncedLtvSliderValue * 100 //? base points 50% => 5000

    return core.fetchBorrowOffers({
      market: marketPubkey,
      bondingCurveType,
      ltvLimit,
      collateralsAmount,
      excludeWallet: walletPubkeyString,
      disableMultiBorrow: false,
    })
  }

  const { data: borrowOffers, isLoading } = useQuery([queryKey], () => fetchBorrowOffers(), {
    staleTime: 15 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!parseFloat(debouncedCollateralsAmount),
  })

  const onChangeLtvSlider = (value: number) => {
    setLtvSlider(value)
  }

  const { selection: offersInCart, set: setOffers, clear: clearOffers } = useSelectedOffers()

  useEffect(() => {
    if (borrowOffers) {
      const collateralTokenDecimals = collateralToken?.collateral.decimals || 0
      const collateralsAmount = parseFloat(inputCollateralsAmount) * marketTokenDecimals

      const updatedOffers = getUpdatedBorrowOffers({
        collateralsAmount,
        offers: borrowOffers,
        tokenDecimals: collateralTokenDecimals,
      })

      setOffers(updatedOffers)
    } else {
      clearOffers()
    }
  }, [
    inputCollateralsAmount,
    collateralToken,
    borrowOffers,
    setOffers,
    walletPubkeyString,
    marketTokenDecimals,
    clearOffers,
  ])

  return {
    data: borrowOffers ?? [],
    isLoading,

    offersInCart,

    setInputCollateralsAmount,
    ltvSliderValue,
    onChangeLtvSlider,
  }
}
