import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { convertAprToApy } from '@banx/utils'

import { SearchableHeading } from '../components'
import { AllTimeBlock, AllocationBlock, CollectionsCardList } from './components'

import styles from './DashboardLendTab.module.less'

const DashboardLendTab = () => {
  const { connected } = useWallet()

  const { marketsPreview } = useMarketsPreview()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const searchSelectParams = {
    onChange: setSelectedOptions,
    options: marketsPreview,
    selectedOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'marketApr',
        format: (apr: number) => createPercentValueJSX(convertAprToApy(apr / 1e4)),
      },
    },
    labels: ['Collection', 'APY'],
  }

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
