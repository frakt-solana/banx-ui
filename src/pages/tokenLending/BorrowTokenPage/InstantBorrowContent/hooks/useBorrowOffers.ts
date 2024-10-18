import { useEffect, useMemo, useRef, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { getBondingCurveTypeFromLendingToken } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { chain, find, minBy } from 'lodash'

import { BorrowOffer, CollateralToken, core } from '@banx/api/tokens'
import { useDebounceValue } from '@banx/hooks'
import { useTokenType } from '@banx/store/common'
import { getTokenDecimals, stringToBN } from '@banx/utils'

import { BorrowToken } from '../../constants'
import { getUpdatedBorrowOffers } from '../OrderBook/helpers'
import { useSelectedOffers } from './useSelectedOffers'

const MAX_TOKEN_TO_GET_TRESHOLD = 100
const DEBOUNCE_DELAY_MS = 600
const MIN_SLIDER_PERCENT = 10

export const useBorrowOffers = (props: {
  collateralToken: CollateralToken | undefined
  borrowToken: BorrowToken | undefined
  collateralInputValue: string
}) => {
  const { collateralToken, borrowToken, collateralInputValue } = props

  const prevCollateralToken = useRef<CollateralToken | undefined>(undefined)

  const [ltvSliderValue, setLtvSlider] = useState(MIN_SLIDER_PERCENT)

  const { tokenType } = useTokenType()

  const debouncedCollateralsAmount = useDebounceValue(collateralInputValue, DEBOUNCE_DELAY_MS)
  const debouncedLtvValue = useDebounceValue(ltvSliderValue, DEBOUNCE_DELAY_MS)

  const { suggestedOffers, allOffers, isLoading } = useFetchOffers({
    collateralToken,
    borrowToken,
    customLtv: debouncedLtvValue,
    collateralAmount: parseFloat(debouncedCollateralsAmount),
  })

  useEffect(() => {
    const isNewCollateralToken = collateralToken !== prevCollateralToken.current

    //? Update slider only if the collateral token changes
    if (isNewCollateralToken && allOffers?.length) {
      setLtvSlider(getLowestLtv(allOffers))
      prevCollateralToken.current = collateralToken
    }
  }, [collateralToken, allOffers])

  const mergedOffers = useMemo(() => {
    if (!suggestedOffers || !allOffers) return []

    const prioritizeOffers = (offer: BorrowOffer) => {
      const matchingOffer = find(suggestedOffers, { publicKey: offer.publicKey })
      const isDisabled = !matchingOffer || debouncedLtvValue >= parseFloat(offer.ltv) / 100

      return { ...(matchingOffer ?? offer), disabled: isDisabled, maxLtv: offer.ltv }
    }

    return chain(allOffers)
      .map(prioritizeOffers)
      .filter((offer) => new BN(offer.maxTokenToGet).gte(new BN(MAX_TOKEN_TO_GET_TRESHOLD)))
      .sortBy((offer) => parseFloat(offer.apr))
      .value()
  }, [allOffers, suggestedOffers, debouncedLtvValue])

  const { set: setOffers, clear: clearOffers } = useSelectedOffers()

  useEffect(() => {
    if (!suggestedOffers) {
      return clearOffers()
    }

    const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType))

    const collateralTokenDecimals = collateralToken?.collateral.decimals || 0
    const collateralsAmount = stringToBN(collateralInputValue, collateralTokenDecimals)

    const updatedOffers = getUpdatedBorrowOffers({
      collateralsAmount,
      offers: suggestedOffers,
      tokenDecimals: marketTokenDecimals,
    })

    setOffers(updatedOffers)
  }, [collateralInputValue, collateralToken, suggestedOffers, tokenType, setOffers, clearOffers])

  return {
    data: mergedOffers,
    isLoading,
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
    ['suggestedBorrowOffers', collateralToken, collateralAmount, borrowToken, customLtv],
    () => fetchOffers(customLtv * 100),
    {
      ...queryOptions,
      enabled: !!customLtv && !!collateralAmount && !!collateralToken,
    },
  )

  const { data: allOffers, isLoading: isLoadingAll } = useQuery(
    ['allBorrowOffers', collateralToken, collateralAmount, borrowToken],
    () => fetchOffers(),
    {
      ...queryOptions,
      enabled: !!collateralToken,
    },
  )

  return { suggestedOffers, allOffers, isLoading: isLoadingSuggested || isLoadingAll }
}

const getLowestLtv = (offers: BorrowOffer[], minSliderPercent = MIN_SLIDER_PERCENT): number => {
  if (!offers.length) return minSliderPercent

  const parseLtv = (ltv: string) => parseFloat(ltv) / 100
  const minLtvOffer = minBy(offers, (offer) => parseLtv(offer.ltv))
  const minLtv = minLtvOffer ? parseLtv(minLtvOffer.ltv) : minSliderPercent

  return Math.max(minLtv, minSliderPercent)
}
