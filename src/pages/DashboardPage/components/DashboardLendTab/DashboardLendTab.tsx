import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

import SearchableHeading from '../SearchableHeading'
import NotConnectedContent from './components/NotConnectedContent'

const DashboardLendTab = () => {
  const { connected } = useWallet()
  const { marketsPreview } = useMarketsPreview()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const searchSelectParams: SearchSelectProps<MarketPreview> = {
    onChange: setSelectedOptions,
    options: marketsPreview,
    selectedOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'offerTvl', format: (value: number) => createSolValueJSX(value, 1e9) },
    },
    labels: ['Collection', 'Offer Tvl'],
  }

  return (
    <>
      {connected && (
        <>
          <SearchableHeading title="Collections" searchSelectParams={searchSelectParams as any} />
          <NotConnectedContent />
        </>
      )}
    </>
  )
}

export default DashboardLendTab
