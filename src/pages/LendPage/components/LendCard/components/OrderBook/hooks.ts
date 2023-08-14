import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

import { useOfferStore } from '../ExpandableCardContent/hooks'
import { Order } from './types'
import { useMarketOrders } from './useMarketOrders'

export interface OrderBookParams {
  orders: Order[]
  goToEditOrder: (orderPubkey: string) => void
  isOwnOrder: (order: Order) => boolean
}

export const useOrderBook = (marketPubkey: string) => {
  const wallet = useWallet()
  const { offerPubkey, setOfferPubkey, syntheticParams } = useOfferStore()
  const { marketsPreview } = useMarketsPreview()

  const selectedMarketPreview = marketsPreview.find(
    (market) => market.marketPubkey === marketPubkey,
  )

  const orderBookParams = useMemo(() => {
    return {
      marketPubkey,
      loanValue: syntheticParams?.loanValue || 0,
      loansAmount: syntheticParams?.loansAmount || 0,
      offerPubkey,
    }
  }, [marketPubkey, syntheticParams, offerPubkey])

  const { orders } = useMarketOrders(orderBookParams)

  const isOwnOrder = (order: Order) => {
    return order?.rawData?.assetReceiver === wallet?.publicKey?.toBase58()
  }

  const goToEditOrder = (orderPubkey: string) => {
    setOfferPubkey(orderPubkey)
  }

  return {
    orderBookParams: {
      orders,
      goToEditOrder,
      isOwnOrder,
    },
    selectedMarketPreview,
  }
}
