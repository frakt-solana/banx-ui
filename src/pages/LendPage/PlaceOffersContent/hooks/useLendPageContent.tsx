import { useMemo, useState } from 'react'

import { filter } from 'lodash'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { MarketPreview } from '@banx/api/core'
import { MARKETS_WITH_CUSTOM_APR } from '@banx/constants'
import { Fire } from '@banx/icons'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { useMarketsURLControl } from '@banx/store'

import { useSortMarkets } from './useSortMarkets'

export const useLendPageContent = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const { selectedMarkets, setSelectedMarkets } = useMarketsURLControl(true)
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

  const hotMarkets = filter(sortedMarkets, (market) => market.isHot)
  const filteredHotMarkets = isHotFilterActive ? hotMarkets : sortedMarkets

  const showEmptyList = !isLoading && !filteredHotMarkets?.length

  const searchSelectParams: SearchSelectProps<MarketPreview> = {
    options: isHotFilterActive ? hotMarkets : marketsPreview,
    selectedOptions: selectedMarkets,
    placeholder: 'Select a collection',
    labels: ['Collection', 'Max APR'],
    favoriteKey: 'lend',
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
        key: 'marketPubkey',
        format: (marketPubkey) => {
          //TODO Refactor this piece of shit (code)
          const customApr = MARKETS_WITH_CUSTOM_APR[marketPubkey as unknown as string]
          const apr = customApr !== undefined ? customApr / 100 : MAX_APR_VALUE
          return createPercentValueJSX(apr)
        },
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
