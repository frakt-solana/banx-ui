import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, isEmpty } from 'lodash'
import { create } from 'zustand'

import { BorrowNft, Offer, core } from '@banx/api/nft'
import { useTokenType } from '@banx/store/common'

import { useMarketsPreview } from '../LendPage'
import { BorrowTabName } from './BorrowPage'

type BorrowTabsState = {
  tab: BorrowTabName | null
  setTab: (tab: BorrowTabName | null) => void
}

export const useBorrowTabs = create<BorrowTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))

export const useBorrowNftsAndMarketsQuery = () => {
  const { tokenType } = useTokenType()
  const { publicKey: walletPublicKey } = useWallet()
  const walletPubkeyString = walletPublicKey?.toBase58() || ''

  //TODO move useMarketsPreview to global hooks folder
  const { marketsPreview: allMarketsPreview, isLoading: isLoadingMarkets } = useMarketsPreview()

  const { data, isLoading: isNftsAndOffersLoading } = useQuery(
    ['borrowNfts', tokenType, walletPubkeyString],
    () =>
      core.fetchBorrowNftsAndOffers({
        walletPubkey: walletPubkeyString,
        tokenType,
      }),
    {
      enabled: !!walletPublicKey,
      staleTime: 10 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  const nftsByMarket: Record<string, BorrowNft[]> = useMemo(() => {
    if (isEmpty(data?.nfts)) return {}

    return chain(data?.nfts || [])
      .groupBy((nft) => nft.loan.marketPubkey)
      .value()
  }, [data])

  const userVaults = useMemo(() => {
    return data?.userVaults || []
  }, [data])

  const offersByMarket: Record<string, Offer[]> = useMemo(() => {
    if (isEmpty(data?.offers)) return {}
    return data?.offers || {}
  }, [data])

  const marketsPreview = useMemo(() => {
    const marketsPubkeys = chain(nftsByMarket).keys().value()
    return allMarketsPreview.filter(({ marketPubkey }) => marketsPubkeys.includes(marketPubkey))
  }, [allMarketsPreview, nftsByMarket])

  return {
    isLoading: isNftsAndOffersLoading || isLoadingMarkets,
    nftsByMarket,
    offersByMarket,
    userVaults,
    marketsPreview,
  }
}
