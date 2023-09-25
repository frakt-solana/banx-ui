import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

import { SearchableHeading } from '../components'
import { AllTimeBlock, AllocationBlock, CollectionsCardList } from './components'

import styles from './DashboardLendTab.module.less'

const DashboardLendTab = () => {
  const { connected } = useWallet()
  const searchSelectParams = useSearchSelectParams()

  return (
    <>
      <div className={classNames(styles.collectionsSection, { [styles.fullWidth]: !connected })}>
        <SearchableHeading title="Collections" searchSelectParams={searchSelectParams as any} />
        <CollectionsCardList />
      </div>
      {connected && (
        <div className={styles.additionalContentSection}>
          <AllocationBlock />
          <AllTimeBlock />
        </div>
      )}
    </>
  )
}

export default DashboardLendTab

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
