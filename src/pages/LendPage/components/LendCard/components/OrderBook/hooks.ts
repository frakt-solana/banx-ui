import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useOfferStore } from '../ExpandableCardContent/hooks'
import { Order } from './types'
import { useMarketOrders } from './useMarketOrders'

export const useOrderBook = (marketPubkey: string) => {
  const wallet = useWallet()
  const { pairPubkey, setPairPubkey, syntheticParams } = useOfferStore()

  const orderBookParams = useMemo(() => {
    return {
      marketPubkey,
      loanValue: syntheticParams?.loanValue || 0,
      loansAmount: syntheticParams?.loansAmount || 0,
      pairPubkey,
    }
  }, [marketPubkey, syntheticParams, pairPubkey])

  const { offers } = useMarketOrders(orderBookParams)

  const isOwnOrder = (order: Order) => {
    return order?.rawData?.assetReceiver === wallet?.publicKey?.toBase58()
  }

  const goToEditOffer = (orderPubkey: string) => {
    setPairPubkey(orderPubkey)
  }

  return {
    orderBookParams: {
      offers,
      goToEditOffer,
      isOwnOrder,
    },
  }
}
