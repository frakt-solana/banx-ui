import { useMemo } from 'react'

import { filter, first, groupBy, includes, map } from 'lodash'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { TokenMarketPreview } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'

const useCollectionsStore = createGlobalState<string[]>([])

export const useFilteredNftsMarkets = (marketsPreview: core.MarketPreview[]) => {
  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const filteredMarkets = useMemo(() => {
    if (selectedCollections.length) {
      return filter(marketsPreview, ({ collectionName }) =>
        includes(selectedCollections, collectionName),
      )
    }
    return marketsPreview
  }, [marketsPreview, selectedCollections])

  const searchSelectParams = {
    onChange: setSelectedCollections,
    options: marketsPreview,
    selectedOptions: selectedCollections,
    optionKeys: {
      labelKey: 'collectionName',
      imageKey: 'collectionImage',
      valueKey: 'collectionName',
      secondLabel: {
        key: 'marketApr',
        format: () => createPercentValueJSX(MAX_APR_VALUE),
      },
    },
    labels: ['Collection', 'Max APR'],
  }

  const sortedMarkets = useMemo(() => {
    return [...filteredMarkets].sort((marketA, marketB) => marketB.offerTvl - marketA.offerTvl)
  }, [filteredMarkets])

  return { filteredMarkets: sortedMarkets, searchSelectParams }
}

const useTokensStore = createGlobalState<string[]>([])

export const useFilteredTokensMarkets = (marketsPreview: TokenMarketPreview[]) => {
  const [selectedTokens, setSelectedTokens] = useTokensStore()

  const filteredMarkets = useMemo(() => {
    if (selectedTokens.length) {
      return filter(marketsPreview, ({ collectionName }) =>
        includes(selectedTokens, collectionName),
      )
    }
    return marketsPreview
  }, [marketsPreview, selectedTokens])

  const marketsGroupedByTicker = groupBy(marketsPreview, (market) => market.collateral.ticker)

  const searchSelectOptions = map(marketsGroupedByTicker, (groupedMarkets) => {
    const firstMarketInGroup = first(groupedMarkets)
    const { ticker = '', logoUrl = '' } = firstMarketInGroup?.collateral || {}
    const marketApr = firstMarketInGroup?.marketApr
    const offersTvl = firstMarketInGroup?.offersTvl

    return { ticker, logoUrl, marketApr, offersTvl }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    onChange: setSelectedTokens,
    selectedOptions: selectedTokens,
    labels: ['Collection', 'Max APR'],
    optionKeys: {
      labelKey: 'ticker',
      valueKey: 'marketPubkey',
      imageKey: 'logoUrl',
      secondLabel: {
        key: 'marketApr',
        format: (value: number) => createPercentValueJSX(value),
      },
    },
  }

  const sortedMarkets = useMemo(() => {
    return [...filteredMarkets].sort((marketA, marketB) => marketB.loansTvl - marketA.loansTvl)
  }, [filteredMarkets])

  return { filteredMarkets: sortedMarkets, searchSelectParams }
}
