import { useEffect, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { getBondingCurveTypeFromLendingToken } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { CollateralToken, core } from '@banx/api/tokens'
import { useDebounceValue } from '@banx/hooks'
import { useTokenType } from '@banx/store/common'
import { getTokenDecimals, stringToBN } from '@banx/utils'

import { BorrowToken } from '../../constants'
import { getUpdatedBorrowOffers } from '../OrderBook/helpers'
import { MAX_TOKEN_TO_GET_TRESHOLD } from './constants'
import { useSelectedOffers } from './useSelectedOffers'

export const useBorrowOffers = (
  collateralToken: CollateralToken | undefined,
  borrowToken: BorrowToken | undefined,
) => {
  const { publicKey } = useWallet()
  const walletPubkeyString = publicKey?.toString() || ''

  const [inputCollateralsAmount, setInputCollateralsAmount] = useState('')
  const [ltvSliderValue, setLtvSlider] = useState(100)

  const { tokenType } = useTokenType()

  const debouncedCollateralsAmount = useDebounceValue(inputCollateralsAmount, 600)
  const debouncedLtvSliderValue = useDebounceValue(ltvSliderValue, 600)

  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const queryKey = [
    'borrowOffers',
    {
      collateralToken,
      borrowToken,
      debouncedLtvSliderValue,
      walletPubkeyString,
    },
  ]

  const fetchBorrowOffers = () => {
    const marketPubkey = collateralToken?.marketPubkey || ''
    const bondingCurveType = getBondingCurveTypeFromLendingToken(tokenType)

    const ltvLimit = debouncedLtvSliderValue * 100 //? base points 50% => 5000

    return core.fetchBorrowOffers({
      market: marketPubkey,
      bondingCurveType,
      ltvLimit,
      excludeWallet: walletPubkeyString || PUBKEY_PLACEHOLDER,
    })
  }

  const { data: borrowOffers, isLoading } = useQuery([queryKey], () => fetchBorrowOffers(), {
    staleTime: 5 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!parseFloat(debouncedCollateralsAmount),
  })

  const onChangeLtvSlider = (value: number) => {
    setLtvSlider(value)
  }

  //? Filter out offers with maxTokenToGet < MAX_TOKEN_TO_GET_TRESHOLD
  const filteredOffers = useMemo(() => {
    if (!borrowOffers) return []

    return borrowOffers.filter((offer) =>
      new BN(offer.maxTokenToGet).lte(new BN(MAX_TOKEN_TO_GET_TRESHOLD)),
    )
  }, [borrowOffers])

  const { selection: offersInCart, set: setOffers, clear: clearOffers } = useSelectedOffers()

  useEffect(() => {
    if (filteredOffers) {
      const collateralsAmount = stringToBN(
        inputCollateralsAmount,
        collateralToken?.collateral.decimals || 0,
      )

      const updatedOffers = getUpdatedBorrowOffers({
        collateralsAmount,
        offers: filteredOffers,
        tokenDecimals: marketTokenDecimals,
      })

      setOffers(updatedOffers)
    } else {
      clearOffers()
    }
  }, [
    inputCollateralsAmount,
    collateralToken,
    filteredOffers,
    setOffers,
    walletPubkeyString,
    marketTokenDecimals,
    clearOffers,
  ])

  return {
    data: filteredOffers ?? [],
    isLoading,

    offersInCart,

    setInputCollateralsAmount,
    ltvSliderValue,
    onChangeLtvSlider,
  }
}
