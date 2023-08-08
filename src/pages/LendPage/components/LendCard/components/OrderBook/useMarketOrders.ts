import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { getTopOrderSize } from 'fbonds-core/lib/fbond-protocol/utils/cartManagerV2'

import { Pair } from '@banx/api/bonds'
import { useMarketPairs } from '@banx/utils/bonds'

type UseMarketOrders = (props: {
  marketPubkey: web3.PublicKey
  walletOwned?: boolean
  size: number //? lamports
  loanValue: number
  loanAmount: number
  pairPubkey: string
}) => {
  offers: any[]
  isLoading: boolean
  hidePair: (pairPubkey: string) => void
}

export const useMarketOrders: UseMarketOrders = ({
  marketPubkey,
  walletOwned,
  size,
  loanValue,
  loanAmount,
  pairPubkey,
}) => {
  const { publicKey } = useWallet()

  const { pairs, isLoading, hidePair } = useMarketPairs({
    marketPubkey: marketPubkey?.toBase58(),
  })

  const offers = useMemo(() => {
    if (!pairs) return []

    const editOffer = pairs.find((pair: Pair) => pair?.publicKey === pairPubkey)
    const editOfferPubkey = editOffer?.publicKey

    const myOffer = {
      size: size / 1e9,
      loanValue,
      loanAmount,
      synthetic: true,
      rawData: {
        publicKey: '',
        assetReceiver: '',
        edgeSettlement: 0,
        authorityAdapter: '',
      },
    }

    const parsedOffers = pairs.map(parseMarketOrder)

    const parsedEditableOffers = editOfferPubkey
      ? parsedOffers.map((offer) =>
          offer?.rawData?.publicKey === editOfferPubkey ? { ...myOffer, ...offer } : offer,
        )
      : []

    if (loanAmount && !editOffer?.publicKey) {
      parsedOffers.push(myOffer)
    }

    const offers = editOfferPubkey ? parsedEditableOffers : parsedOffers

    return offers
  }, [pairs, walletOwned, publicKey, size])

  return {
    offers,
    isLoading,
    hidePair,
  }
}

const parseMarketOrder = (pair: any): any => {
  return {
    loanValue: pair.fundsSolOrTokenBalance / 1e9,
    size: (pair ? getTopOrderSize(pair) * pair?.currentSpotPrice : 0) / 1e9,
    loanAmount: pair?.buyOrdersQuantity,
    rawData: {
      publicKey: pair?.publicKey || '',
      assetReceiver: pair?.assetReceiver || '',
      edgeSettlement: pair ? getTopOrderSize(pair) : 0,
      authorityAdapter: '',
      bondFeature: pair?.validation?.bondFeatures,
      maxReturnAmountFilter: pair?.validation?.maxReturnAmountFilter,
      fundsSolOrTokenBalance: pair?.fundsSolOrTokenBalance,
      loanToValueFilter: pair?.validation?.loanToValueFilter,
    },
  }
}
