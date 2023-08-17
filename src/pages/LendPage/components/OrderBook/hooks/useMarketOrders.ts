import { useMemo } from 'react'

import { Offer } from '@banx/api/bonds'
import { useMarketOffers } from '@banx/pages/LendPage/hooks'

import { parseMarketOrder } from '../helpers'
import { Order } from '../types'

type UseMarketOrders = (props: {
  marketPubkey: string
  loanValue: number
  loansAmount: number
  offerPubkey: string
}) => {
  orders: Order[]
  isLoading: boolean
  bestOrder: Order
}

export const useMarketOrders: UseMarketOrders = ({
  marketPubkey,
  loanValue,
  loansAmount,
  offerPubkey,
}) => {
  const { offers, isLoading } = useMarketOffers({ marketPubkey })

  const orders = useProcessedOrders({
    offers,
    loanValue,
    loansAmount,
    offerPubkey,
  })

  const sortedOrders = useMemo(() => {
    return [...orders].sort((orderA, orderB) => orderB.loanValue - orderA.loanValue)
  }, [orders])

  const bestOrder = useMemo(() => {
    const [firstOrder, secondOrder] = sortedOrders
    return firstOrder?.synthetic ? secondOrder : firstOrder
  }, [sortedOrders])

  return {
    orders: sortedOrders,
    isLoading,
    bestOrder,
  }
}

type UseProcessedOrders = (props: {
  offers: Offer[]
  loanValue: number
  loansAmount: number
  offerPubkey: string
}) => Order[]

const useProcessedOrders: UseProcessedOrders = ({
  offers,
  loanValue,
  loansAmount,
  offerPubkey,
}) => {
  return useMemo(() => {
    if (!offers) return []

    const editOffer = offers.find((offer: Offer) => offer.publicKey === offerPubkey)
    const editOfferPubkey = editOffer?.publicKey

    const syntheticOrder = {
      size: loanValue * loansAmount,
      loanValue,
      loansAmount,
      synthetic: true,
      rawData: {
        publicKey: '',
        assetReceiver: '',
      },
    }

    const parsedOrders = offers.map(parseMarketOrder)

    const processedEditableOrders = parsedOrders.map((order: Order) => {
      const shouldReplace = editOfferPubkey && order.rawData.publicKey === editOfferPubkey
      return shouldReplace ? { ...syntheticOrder, ...order } : order
    })

    if (loansAmount && !editOfferPubkey) {
      parsedOrders.push(syntheticOrder)
    }

    return editOfferPubkey ? processedEditableOrders : parsedOrders
  }, [offers, loanValue, loansAmount, offerPubkey])
}
