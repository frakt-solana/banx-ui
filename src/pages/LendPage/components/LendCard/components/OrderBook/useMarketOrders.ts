import { useMemo } from 'react'

import { Pair } from '@banx/api/bonds'
import { useMarketPairs } from '@banx/utils/bonds'

import { parseMarketOrder } from './helpers'
import { MarketOrder } from './types'

type UseMarketOrders = (props: {
  marketPubkey: string
  loanValue: number
  loansAmount: number
  pairPubkey: string
}) => {
  offers: MarketOrder[]
  isLoading: boolean
  hidePair: (pairPubkey: string) => void
}

export const useMarketOrders: UseMarketOrders = ({
  marketPubkey,
  loanValue,
  loansAmount,
  pairPubkey,
}) => {
  const { pairs, isLoading, hidePair } = useMarketPairs({ marketPubkey })

  const offers = useMemo(() => {
    if (!pairs) return []

    const editOffer = pairs.find((pair: Pair) => pair?.publicKey === pairPubkey)
    const editOfferPubkey = editOffer?.publicKey

    const myOffer = {
      size: loanValue * loansAmount,
      loanValue,
      loansAmount,
      synthetic: true,
      rawData: {
        publicKey: '',
        assetReceiver: '',
      },
    }

    const parsedOffers = pairs.map(parseMarketOrder)

    const parsedEditableOffers = editOfferPubkey
      ? parsedOffers.map((offer) =>
          offer?.rawData?.publicKey === editOfferPubkey ? { ...myOffer, ...offer } : offer,
        )
      : []

    if (loansAmount && !editOffer?.publicKey) {
      parsedOffers.push(myOffer as any)
    }

    const offers = editOfferPubkey ? parsedEditableOffers : parsedOffers

    return offers
  }, [pairs, loanValue, loansAmount, pairPubkey])

  return {
    offers,
    isLoading,
    hidePair,
  }
}
