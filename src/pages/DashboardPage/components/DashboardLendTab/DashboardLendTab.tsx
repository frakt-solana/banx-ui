import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

import SearchableHeading from '../SearchableHeading'
import AllTimeBlock from './components/AllTimeBlock'
import AllocationBlock from './components/AllocationBlock'
import { CollectionsCardList } from './components/components'

import styles from './DashboardLendTab.module.less'

const DashboardLendTab = () => {
  const { connected } = useWallet()

  return connected ? <ConnectedContent /> : <NotConnectedContent />
}

export default DashboardLendTab

const ConnectedContent = () => {
  const searchSelectParams = useSearchSelectParams()

  return (
    <div className={styles.connectedContainer}>
      <div className={styles.collectionsSection}>
        <SearchableHeading title="Collections" searchSelectParams={searchSelectParams as any} />
        <CollectionsCardList />
      </div>
      <div className={styles.additionalContentSection}>
        <AllocationBlock />
        <AllTimeBlock />
      </div>
    </div>
  )
}

const NotConnectedContent = () => {
  const searchSelectParams = useSearchSelectParams()

  return (
    <div className={styles.notConnectedContainer}>
      <SearchableHeading title="Collections" searchSelectParams={searchSelectParams as any} />
      <CollectionsCardList />
    </div>
  )
}

const useSearchSelectParams = () => {
  const { marketsPreview } = useMarketsPreview()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  return {
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
}
