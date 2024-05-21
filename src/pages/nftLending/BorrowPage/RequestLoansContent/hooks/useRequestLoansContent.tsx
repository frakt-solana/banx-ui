import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { chain, first, isEmpty } from 'lodash'

import { MAX_BORROWER_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { NFT_MARKETS_WITH_CUSTOM_APR } from '@banx/constants'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage'
import { createGlobalState } from '@banx/store'

import { useBorrowNfts } from '../../hooks'
import { useSortedMarkets } from './useSortedMarkets'

const useCollectionsStore = createGlobalState<string[]>([])

export const useRequestLoansContent = () => {
  const { marketsPreview, isLoading: isLoadingMarkets } = useMarketsPreview()
  const { nfts } = useBorrowNfts()
  const { connected } = useWallet()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()
  const [visibleMarketPubkey, setMarketPubkey] = useState('')

  const onCardClick = (marketPubkey: string) => {
    const isSameMarketPubkey = visibleMarketPubkey === marketPubkey
    const nextValue = !isSameMarketPubkey ? marketPubkey : ''
    return setMarketPubkey(nextValue)
  }

  const markets = useMemo(() => {
    if (!connected) return marketsPreview

    //? markets with user nfts
    const marketsPubkeys = chain(nfts)
      .groupBy((nft) => nft.loan.marketPubkey)
      .map((groupedNfts) => first(groupedNfts)?.loan.marketPubkey)
      .value()

    return marketsPreview.filter(({ marketPubkey }) => marketsPubkeys.includes(marketPubkey))
  }, [connected, marketsPreview, nfts])

  const filteredMarkets = useMemo(() => {
    if (!selectedCollections.length) return markets

    return markets.filter((market) => selectedCollections.includes(market.collectionName))
  }, [selectedCollections, markets])

  const { sortedMarkets, sortParams } = useSortedMarkets(filteredMarkets)

  const searchSelectParams = createSearchSelectParams({
    options: markets,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const isLoading = isLoadingMarkets && isEmpty(marketsPreview)
  const showEmptyList = connected && !isLoadingMarkets && isEmpty(filteredMarkets)

  return {
    markets: sortedMarkets,
    visibleMarketPubkey,
    onCardClick,
    searchSelectParams,
    sortParams,
    isLoading,
    showEmptyList,
  }
}

interface CreateSearchSelectProps {
  options: core.MarketPreview[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  options,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const searchSelectParams = {
    options,
    selectedOptions,
    onChange,
    labels: ['Collection', 'Max APR'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'marketPubkey',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'marketPubkey',
        //TODO Refactor this piece of shit (code)
        format: (marketPubkey: unknown) => {
          const customApr = NFT_MARKETS_WITH_CUSTOM_APR[marketPubkey as string]
          const apr = customApr !== undefined ? customApr / 100 : MAX_BORROWER_APR_VALUE
          return createPercentValueJSX(apr)
        },
      },
    },
  }

  return searchSelectParams
}
