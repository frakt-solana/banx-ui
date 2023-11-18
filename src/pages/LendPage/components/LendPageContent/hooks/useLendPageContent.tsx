import { useMemo, useState } from 'react'

import { partition, sortBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import Tooltip from '@banx/components/Tooltip'

import { MarketPreview } from '@banx/api/core'
import { Fire } from '@banx/icons'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { useMarketsURLControl } from '@banx/store'
import { convertAprToApy } from '@banx/utils'

import { useSortMarkets } from './useSortMarkets'

export const useLendPageContent = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const { selectedMarkets, setSelectedMarkets } = useMarketsURLControl()
  const [isHotFilterActive, setIsHotFilterActive] = useState(false)

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

  const sortedAndFilteredMarkets = useMemo(() => {
    if (isHotFilterActive) {
      const [hotMarkets, nonHotMarkets] = partition(sortedMarkets, 'isHot')
      const sortedHotMarkets = sortBy(hotMarkets, 'loansTvl').reverse()
      const sortedNonHotMarkets = sortBy(nonHotMarkets, 'loansTvl').reverse()

      return [...sortedHotMarkets, ...sortedNonHotMarkets]
    }
    return sortedMarkets
  }, [isHotFilterActive, sortedMarkets])

  const searchSelectParams: SearchSelectProps<MarketPreview> = {
    options: marketsPreview,
    selectedOptions: selectedMarkets,
    placeholder: 'Select a collection',
    labels: ['Collection', 'APY'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'marketPubkey',
      imageKey: 'collectionImage',
      labelIcon: {
        key: 'isHot',
        icon: (
          <Tooltip title="Collection is in huge demand waiting for lenders!">
            <Fire />
          </Tooltip>
        ),
      },
      secondLabel: {
        key: 'marketApr',
        format: (value: number) => `${convertAprToApy(value / 1e4)} %`,
      },
    },
    onChange: handleFilterChange,
  }

  return {
    marketsPreview: sortedAndFilteredMarkets,
    isLoading,
    showEmptyList,
    searchSelectParams,
    sortParams,
    isHotFilterActive,
    onToggleHotFilter: () => setIsHotFilterActive(!isHotFilterActive),
  }
}
