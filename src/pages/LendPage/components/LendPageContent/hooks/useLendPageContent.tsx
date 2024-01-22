import { useMemo, useState } from 'react'

import { filter } from 'lodash'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { MarketPreview } from '@banx/api/core'
import { Fire } from '@banx/icons'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { useMarketsURLControl } from '@banx/store'

import { useSortMarkets } from './useSortMarkets'

export const useLendPageContent = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const { selectedMarkets, setSelectedMarkets } = useMarketsURLControl()
  const [isHotFilterActive, setIsHotFilterActive] = useState(false)

  const handleFilterChange = (filteredOptions: string[]) => {
    setSelectedMarkets(filteredOptions)
  }

  const filteredMarkets = useMemo(() => {
    return marketsPreview.filter(({ collectionName }) => selectedMarkets.includes(collectionName))
  }, [marketsPreview, selectedMarkets])

  const { sortedMarkets, sortParams } = useSortMarkets(
    filteredMarkets.length ? filteredMarkets : marketsPreview,
  )

  const hotMarkets = filter(sortedMarkets, 'isHot')
  const filteredHotMarkets = isHotFilterActive ? hotMarkets : sortedMarkets

  const showEmptyList = !isLoading && !filteredHotMarkets?.length

  const searchSelectParams: SearchSelectProps<MarketPreview> = {
    options: isHotFilterActive ? hotMarkets : marketsPreview,
    selectedOptions: selectedMarkets,
    placeholder: 'Select a collection',
    labels: ['Collection', 'Max APR'],
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
        format: () => createPercentValueJSX(MAX_APR_VALUE),
      },
    },
    onChange: handleFilterChange,
  }

  return {
    marketsPreview: filteredHotMarkets,
    isLoading,
    showEmptyList,
    searchSelectParams,
    sortParams,
    isHotFilterActive,
    hotMarkets,
    onToggleHotFilter: () => setIsHotFilterActive(!isHotFilterActive),
  }
}
