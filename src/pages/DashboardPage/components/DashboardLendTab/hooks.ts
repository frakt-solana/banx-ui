import { useMemo } from 'react'

import { filter, includes } from 'lodash'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { createGlobalState } from '@banx/store/functions'

export const useDashboardLendTab = () => {
  const { marketsPreview } = useMarketsPreview()
  const { filteredMarkets, searchSelectParams } = useFilteredMarkets(marketsPreview)

  const sortedMarketsByOfferTvl = useMemo(() => {
    return [...filteredMarkets].sort((marketA, marketB) => marketB?.offerTvl - marketA?.offerTvl)
  }, [filteredMarkets])

  return { marketsPreview: sortedMarketsByOfferTvl, searchSelectParams }
}

const useCollectionsStore = createGlobalState<string[]>([])

const useFilteredMarkets = (marketsPreview: MarketPreview[]) => {
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
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'marketApr',
        format: () => createPercentValueJSX(MAX_APR_VALUE),
      },
    },
    labels: ['Collection', 'Max APR'],
  }

  return { filteredMarkets, searchSelectParams }
}
