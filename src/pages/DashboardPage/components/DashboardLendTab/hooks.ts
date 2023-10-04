import { useMemo, useState } from 'react'

import { filter, includes } from 'lodash'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { convertAprToApy } from '@banx/utils'

export const useDashboardLendTab = () => {
  const { marketsPreview } = useMarketsPreview()
  const { filteredMarkets, searchSelectParams } = useFilteredMarkets(marketsPreview)

  return { marketsPreview: filteredMarkets, searchSelectParams }
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
        format: (apr: number) => createPercentValueJSX(convertAprToApy(apr / 1e4)),
      },
    },
    labels: ['Collection', 'APY'],
  }

  return { filteredMarkets, searchSelectParams }
}
