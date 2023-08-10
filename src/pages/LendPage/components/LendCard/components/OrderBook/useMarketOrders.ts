import { useMemo } from 'react'

import { BondOffer } from '@banx/api/bonds'
import { useMarketPairs } from '@banx/pages/LendPage/hooks'

import { parseMarketOrder } from './helpers'
import { Order } from './types'

type UseMarketOrders = (props: {
  marketPubkey: string
  loanValue: number
  loansAmount: number
  pairPubkey: string
}) => {
  offers: Order[]
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

    const editOffer = pairs.find((pair: BondOffer) => pair?.publicKey === pairPubkey)
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
      ? parsedOffers.map((offer: Order) =>
          offer?.rawData?.publicKey === editOfferPubkey ? { ...myOffer, ...offer } : offer,
        )
      : []

    if (loansAmount && !editOffer?.publicKey) {
      parsedOffers.push(myOffer)
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
