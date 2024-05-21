import { useMemo, useState } from 'react'

import { filter } from 'lodash'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/nft'
import { NFT_MARKETS_WITH_CUSTOM_APR } from '@banx/constants'
import { Fire } from '@banx/icons'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage/hooks'
import { useMarketsURLControl } from '@banx/store/common'

import { useSortedMarkets } from './useSortedMarkets'

export const useLendPageContent = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const { selectedMarkets, setSelectedMarkets } = useMarketsURLControl(true)
  const [isHotFilterActive, setIsHotFilterActive] = useState(false)

  const handleFilterChange = (filteredOptions: string[]) => {
    setSelectedMarkets(filteredOptions)
  }

  const filteredMarkets = useMemo(() => {
    if (!selectedMarkets.length) return marketsPreview
    return marketsPreview.filter(({ collectionName }) => selectedMarkets.includes(collectionName))
  }, [marketsPreview, selectedMarkets])

  const { sortedMarkets, sortParams } = useSortedMarkets(filteredMarkets)

  const hotMarkets = filter(sortedMarkets, (market) => market.isHot)
  const filteredHotMarkets = isHotFilterActive ? hotMarkets : sortedMarkets

  const showEmptyList = !isLoading && !filteredHotMarkets?.length

  const searchSelectParams: SearchSelectProps<core.MarketPreview> = {
    options: isHotFilterActive ? hotMarkets : marketsPreview,
    selectedOptions: selectedMarkets,
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
          const customApr = NFT_MARKETS_WITH_CUSTOM_APR[marketPubkey as unknown as string]
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
