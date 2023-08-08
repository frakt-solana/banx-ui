import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

import { useOfferStore } from '../ExpandableCardContent/hooks'
import { useMarketOrders } from './useMarketOrders'

export const useOrderBook = (marketPubkey: string) => {
  const wallet = useWallet()
  const { pairPubkey, setPairPubkey, syntheticParams } = useOfferStore()

  const orderBookParams = useMemo(() => {
    return {
      marketPubkey: marketPubkey && new web3.PublicKey(marketPubkey),
      size: syntheticParams?.offerSize,
      loanValue: syntheticParams?.loanValue,
      loanAmount: syntheticParams?.loanAmount,
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
