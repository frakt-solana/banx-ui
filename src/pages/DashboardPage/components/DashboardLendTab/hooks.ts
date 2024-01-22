import { useMemo, useState } from 'react'

import { filter, includes } from 'lodash'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

export const useDashboardLendTab = () => {
  const { marketsPreview } = useMarketsPreview()
  const { filteredMarkets, searchSelectParams } = useFilteredMarkets(marketsPreview)

  const sortedMarketsByOfferTvl = useMemo(() => {
    return [...filteredMarkets].sort((marketA, marketB) => marketB?.offerTvl - marketA?.offerTvl)
  }, [filteredMarkets])

  return { marketsPreview: sortedMarketsByOfferTvl, searchSelectParams }
}

const useFilteredMarkets = (marketsPreview: MarketPreview[]) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const filteredMarkets = useMemo(() => {
    if (selectedOptions.length) {
      return filter(marketsPreview, ({ collectionName }) =>
        includes(selectedOptions, collectionName),
      )
    }
    return marketsPreview
  }, [marketsPreview, selectedOptions])

  const searchSelectParams = {
    onChange: setSelectedOptions,
    options: marketsPreview,
    selectedOptions,
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
