import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

export const useDashboardBorrowTab = () => {
  const { connected } = useWallet()

  const searchSelectParams = useSearchSelectParams()

  const { marketsPreview } = useMarketsPreview()
  const { nfts } = useBorrowNfts()

  const headingText = connected ? 'Click to borrow' : '1 click loan'

  const marketsTotalStats = useMemo(() => {
    const totalMarkets = marketsPreview.length
    const totalLiquidity = sumBy(marketsPreview, 'offerTvl')

    return { totalMarkets, totalLiquidity }
  }, [marketsPreview])

  const nftsTotalStats = useMemo(() => {
    const userNFTs = nfts.length

    return { userNFTs }
  }, [nfts])

  const showMyLoans = connected

  return {
    marketsPreview,
    searchSelectParams,
    nfts,
    headingText,
    showMyLoans,
    marketsTotalStats,
    nftsTotalStats,
    connected,
  }
}

export const useSearchSelectParams = () => {
  const { marketsPreview } = useMarketsPreview()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  return {
    onChange: setSelectedOptions,
    options: marketsPreview,
    selectedOptions,
    optionKeys: {
      labelKey: 'collectionName',
      imageKey: 'collectionImage',
      valueKey: 'collectionName',
    },
    secondLabel: { key: 'offerTvl', format: (value: number) => createSolValueJSX(value, 1e9) },
    labels: ['Collection', 'Offer Tvl'],
  }
}
