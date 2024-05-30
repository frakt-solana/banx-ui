import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { NFT_MARKETS_WITH_CUSTOM_APR } from '@banx/constants'
import { createGlobalState } from '@banx/store'

import { useTokenMarketsPreview } from '../../hooks'
import { useSortedMarkets } from './useSortedMarkets'

const useCollectionsStore = createGlobalState<string[]>([])

export const usePlaceTokenOffers = () => {
  const { connected } = useWallet()

  const { marketsPreview, isLoading: isLoadingMarkets } = useTokenMarketsPreview()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const [visibleMarketPubkey, setMarketPubkey] = useState('')

  const onCardClick = (marketPubkey: string) => {
    const isSameMarketPubkey = visibleMarketPubkey === marketPubkey
    const nextValue = !isSameMarketPubkey ? marketPubkey : ''
    return setMarketPubkey(nextValue)
  }

  const filteredMarkets = useMemo(() => {
    if (!selectedCollections.length) return marketsPreview

    return marketsPreview.filter((market) =>
      selectedCollections.includes(market.collateralTokenTicker),
    )
  }, [marketsPreview, selectedCollections])

  const { sortedMarkets, sortParams } = useSortedMarkets(filteredMarkets)

  const searchSelectParams = createSearchSelectParams({
    options: marketsPreview,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const isLoading = isLoadingMarkets && isEmpty(marketsPreview)
  const showEmptyList = connected && !isLoadingMarkets && isEmpty(filteredMarkets)

  return {
    marketsPreview: sortedMarkets,
    visibleMarketPubkey,
    onCardClick,

    searchSelectParams,
    sortParams,

    showEmptyList,
    isLoading,
  }
}

interface CreateSearchSelectProps {
  options: core.TokenMarketPreview[]
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
    labels: ['Collateral', 'APR'],
    optionKeys: {
      labelKey: 'collateralTokenTicker',
      valueKey: 'marketPubkey',
      imageKey: 'collateralTokenImageUrl',
      secondLabel: {
        key: 'marketPubkey',
        //TODO Refactor this piece of shit (code)
        format: (marketPubkey: unknown) => {
          const customApr = NFT_MARKETS_WITH_CUSTOM_APR[marketPubkey as string]
          const apr = customApr !== undefined ? customApr / 100 : MAX_APR_VALUE
          return createPercentValueJSX(apr)
        },
      },
    },
  }

  return searchSelectParams
}
