import { useMemo } from 'react'

import { SearchSelectProps } from '@banx/components/SearchSelect'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { useSearchMarketsURLControl } from '@banx/store'
import { convertAprToApy } from '@banx/utils'

import { useSortMarkets } from './useSortMarkets'

export const useLendPageContent = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const { selectedMarkets, setSelectedMarkets } = useSearchMarketsURLControl()

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
    labels: ['Collections', 'APY'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'marketPubkey',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'marketAPR',
        format: (value: number) => `${convertAprToApy(value / 1e4)?.toFixed(0)} %`,
      },
    },
    onChange: handleFilterChange,
  }

  return {
    marketsPreview: sortedMarkets,
    isLoading,
    showEmptyList,
    searchSelectParams,
    sortParams,
  }
}
