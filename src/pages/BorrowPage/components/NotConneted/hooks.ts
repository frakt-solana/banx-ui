import { useMemo, useState } from 'react'

import { SearchSelectProps } from '@banx/components/SearchSelect'

import { MarketPreview } from '@banx/api/core'
import { useSortMarkets } from '@banx/pages/LendPage/components/LendPageContent/hooks/useSortMarkets'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

export const useNotConnectedBorrow = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])

  const showEmptyList = !isLoading && !marketsPreview?.length

  const handleFilterChange = (filteredOptions: string[]) => {
    setSelectedMarkets(filteredOptions)
  }

  const filteredMarkets = useMemo(() => {
    return marketsPreview.filter(({ collectionName }) => selectedMarkets.includes(collectionName))
  }, [marketsPreview, selectedMarkets])

  const { sortedMarkets, sortParams } = useSortMarkets(
    filteredMarkets.length ? filteredMarkets : marketsPreview,
  )

  const searchSelectParams: SearchSelectProps<MarketPreview> = {
    options: marketsPreview,
    selectedOptions: selectedMarkets,
    placeholder: 'Select a collection',
    labels: ['Collection', 'APR'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'marketPubkey',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'marketAPR',
        format: (value: number) => `${value / 1e2} %`,
      },
    },
    onChange: handleFilterChange,
  }

  return {
    marketsPreview: sortedMarkets,
    isLoading,
    showEmptyList,

    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
