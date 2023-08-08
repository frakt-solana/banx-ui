import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useOfferStore } from '../ExpandableCardContent/hooks'
import { useMarketOrders } from './useMarketOrders'

export const useOrderBook = (marketPubkey: string) => {
  const wallet = useWallet()
  const { pairPubkey, setPairPubkey, syntheticParams } = useOfferStore()

  const orderBookParams = useMemo(() => {
    return {
      marketPubkey,
      loanValue: syntheticParams?.loanValue,
      loansAmount: syntheticParams?.loansAmount,
      pairPubkey,
    }
  }, [marketPubkey, syntheticParams])

  const { offers } = useMarketOrders(orderBookParams as any)

  const isOwnOrder = (order: any): boolean => {
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
