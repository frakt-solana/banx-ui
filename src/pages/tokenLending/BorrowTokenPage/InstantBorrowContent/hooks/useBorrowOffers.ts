import { useEffect, useMemo, useState } from 'react'

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

export enum BorrowInputType {
  Input = 'input',
  Output = 'output',
}

export const useBorrowOffers = (
  collateralToken: CollateralToken | undefined,
  borrowToken: BorrowToken | undefined,
) => {
  const { publicKey } = useWallet()
  const walletPubkeyString = publicKey?.toString() || ''

  const [inputType, setInputType] = useState<BorrowInputType>(BorrowInputType.Input)

  const [collateralsAmount, setCollateralsAmount] = useState('') //? collateralAmount without decimals
  const [ltvSliderValue, setLtvSlider] = useState(100)

  const { tokenType } = useNftTokenType()

  const debouncedCollateralsAmount = useDebounceValue(collateralsAmount, 1000)
  const debouncedLtvSliderValue = useDebounceValue(ltvSliderValue, 1000)

  const marketTokenDecimals = getTokenDecimals(tokenType) //? 1e9, 1e6

  const queryKey = [
    'borrowOffers',
    {
      collateralToken,
      borrowToken,
      inputType,
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
    enabled: !!parseFloat(collateralsAmount) && !!collateralToken,
  })

  const onChangeLtvSlider = (value: number) => {
    setLtvSlider(value)
  }

  const { selection: offersInCart, set: setOffers } = useSelectedOffers()

  useEffect(() => {
    if (borrowOffers) {
      const collateralTokenDecimals = collateralToken?.collateral.decimals || 0

      const formattedCollateralsAmount = parseFloat(collateralsAmount) * marketTokenDecimals

      const updatedOffers = getUpdatedBorrowOffers({
        collateralsAmount: formattedCollateralsAmount,
        offers: borrowOffers,
        tokenDecimals: collateralTokenDecimals,
      })

      setOffers(updatedOffers, walletPubkeyString)
    }
  }, [
    collateralsAmount,
    collateralToken,
    borrowOffers,
    setOffers,
    walletPubkeyString,
    marketTokenDecimals,
  ])

  const rawOffersInCart = useMemo(() => {
    return offersInCart.map((offer) => offer.offer)
  }, [offersInCart])

  return {
    data: borrowOffers ?? [],
    isLoading,

    offersInCart: rawOffersInCart,

    inputType,
    setInputType,
    setCollateralsAmount,
    ltvSliderValue,
    onChangeLtvSlider,
  }
}
