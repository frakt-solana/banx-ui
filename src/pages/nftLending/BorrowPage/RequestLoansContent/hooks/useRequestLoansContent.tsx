import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'

import { MAX_BORROWER_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { NFT_MARKETS_WITH_CUSTOM_APR } from '@banx/constants'
import { createGlobalState } from '@banx/store'

import { useBorrowNftsAndMarketsQuery } from '../../hooks'
import { useSortedMarkets } from './useSortedMarkets'

const useCollectionsStore = createGlobalState<string[]>([])

export const useRequestLoansContent = () => {
  const { marketsPreview, isLoading } = useBorrowNftsAndMarketsQuery()

  const { connected } = useWallet()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()
  const [visibleMarketPubkey, setMarketPubkey] = useState('')

  const onCardClick = (marketPubkey: string) => {
    const isSameMarketPubkey = visibleMarketPubkey === marketPubkey
    const nextValue = !isSameMarketPubkey ? marketPubkey : ''
    return setMarketPubkey(nextValue)
  }

  const filteredMarkets = useMemo(() => {
    if (!selectedCollections.length) return marketsPreview

    return marketsPreview.filter((market) => selectedCollections.includes(market.collectionName))
  }, [selectedCollections, marketsPreview])

  const { sortedMarkets, sortParams } = useSortedMarkets(filteredMarkets)

  const searchSelectParams = createSearchSelectParams({
    options: marketsPreview,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const showEmptyList = connected && !isLoading && isEmpty(filteredMarkets)

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
