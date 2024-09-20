import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, includes } from 'lodash'

import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage/hooks'
import { createGlobalState } from '@banx/store'

import { useBorrowerStats } from '../../hooks'

const useCollectionsStore = createGlobalState<string[]>([])

const useFilteredMarketsAndNFTs = (marketsPreview: core.MarketPreview[]) => {
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
        key: 'offerTvl',
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
    labels: ['Collection', 'Liquidity'],
  }

  return { filteredMarkets, searchSelectParams }
}

export const useDashboardBorrowTab = () => {
  const { connected } = useWallet()

  const { data: borrowerStats } = useBorrowerStats()
  const { marketsPreview, isLoading: isLoadingMarkets } = useMarketsPreview()

  const { filteredMarkets, searchSelectParams } = useFilteredMarketsAndNFTs(marketsPreview)

  const headingText = connected ? 'Click to borrow' : '1 click loan'

  return {
    marketsPreview: filteredMarkets,
    borrowerStats,
    headingText,
    searchSelectParams,
    isConnected: connected,
    loading: isLoadingMarkets,
  }
}
