import { useEffect, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { getBondingCurveTypeFromLendingToken } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { chain, find } from 'lodash'

import { BorrowOffer, CollateralToken, core } from '@banx/api/tokens'
import { useDebounceValue } from '@banx/hooks'
import { useTokenType } from '@banx/store/common'
import { getTokenDecimals, stringToBN } from '@banx/utils'

import { BorrowToken } from '../../constants'
import { getUpdatedBorrowOffers } from '../OrderBook/helpers'
import { useSelectedOffers } from './useSelectedOffers'

const MAX_TOKEN_TO_GET_TRESHOLD = 100
const DEBOUNCE_DELAY_MS = 600

export const useBorrowOffers = (
  collateralToken: CollateralToken | undefined,
  borrowToken: BorrowToken | undefined,
) => {
  const [inputCollateralsAmount, setInputCollateralsAmount] = useState('')
  const [ltvSliderValue, setLtvSlider] = useState(100)

  const { tokenType } = useTokenType()

  const debouncedCollateralsAmount = useDebounceValue(inputCollateralsAmount, DEBOUNCE_DELAY_MS)
  const debouncedLtvValue = useDebounceValue(ltvSliderValue, DEBOUNCE_DELAY_MS)

  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const { suggestedOffers, allOffers, isLoading } = useFetchOffers({
    collateralToken,
    borrowToken,
    customLtv: debouncedLtvValue,
    collateralAmount: parseFloat(debouncedCollateralsAmount),
  })

  const mergedOffers = useMemo(() => {
    if (!suggestedOffers || !allOffers) return []

    const prioritizeOffers = (offer: BorrowOffer) => {
      const matchingOffer = find(suggestedOffers, { publicKey: offer.publicKey })
      const isDisabled = !matchingOffer || debouncedLtvValue >= parseFloat(offer.ltv) / 100

      return { ...(matchingOffer ?? offer), disabled: isDisabled }
    }

    return chain(allOffers)
      .map(prioritizeOffers)
      .filter((offer) => new BN(offer.maxTokenToGet).gte(new BN(MAX_TOKEN_TO_GET_TRESHOLD)))
      .sortBy((offer) => parseFloat(offer.apr))
      .value()
  }, [allOffers, suggestedOffers, debouncedLtvValue])

  const { selection: offersInCart, set: setOffers, clear: clearOffers } = useSelectedOffers()

  useEffect(() => {
    if (!suggestedOffers) {
      return clearOffers()
    }

    const collateralTokenDecimals = collateralToken?.collateral.decimals || 0
    const collateralsAmount = stringToBN(inputCollateralsAmount, collateralTokenDecimals)

    const updatedOffers = getUpdatedBorrowOffers({
      collateralsAmount,
      offers: suggestedOffers,
      tokenDecimals: marketTokenDecimals,
    })

    setOffers(updatedOffers)
  }, [
    inputCollateralsAmount,
    collateralToken,
    suggestedOffers,
    marketTokenDecimals,
    setOffers,
    clearOffers,
  ])

  return {
    data: mergedOffers,
    isLoading,

    offersInCart,

    setInputCollateralsAmount,
    ltvSliderValue,
    onChangeLtvSlider: setLtvSlider,
  }
}

const useFetchOffers = (props: {
  collateralToken: CollateralToken | undefined
  borrowToken: BorrowToken | undefined
  collateralAmount: number
  customLtv: number
}) => {
  const { collateralToken, borrowToken, collateralAmount, customLtv } = props

  const wallet = useWallet()
  const walletPubkey = wallet.publicKey?.toBase58() || PUBKEY_PLACEHOLDER

  const { tokenType } = useTokenType()

  const queryParams = {
    market: collateralToken?.marketPubkey ?? '',
    bondingCurveType: getBondingCurveTypeFromLendingToken(tokenType),
    excludeWallet: walletPubkey,
  }

  const fetchOffers = (customLtv?: number) => core.fetchBorrowOffers({ ...queryParams, customLtv })

  const queryOptions = {
    staleTime: 5000,
    refetchOnWindowFocus: false,
  }

  const { data: suggestedOffers, isLoading: isLoadingSuggested } = useQuery(
    ['suggestedBorrowOffers', collateralAmount, borrowToken, customLtv],
    () => fetchOffers(customLtv * 100),
    {
      ...queryOptions,
      enabled: !!customLtv && !!collateralAmount && !!collateralToken,
    },
  )

  const { data: allOffers, isLoading: isLoadingAll } = useQuery(
    ['allBorrowOffers', collateralAmount, borrowToken],
    () => fetchOffers(),
    {
      ...queryOptions,
      enabled: !!collateralToken,
    },
  )

  return { suggestedOffers, allOffers, isLoading: isLoadingSuggested || isLoadingAll }
}
