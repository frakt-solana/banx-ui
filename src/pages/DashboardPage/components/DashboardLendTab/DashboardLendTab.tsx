import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { useLenderStats } from '../../hooks'
import { SearchableHeading } from '../components'
import { AllTimeBlock, CollectionsCardList } from './components'
import AllocationBlock from './components/AllocationBlock'
import { useDashboardLendTab } from './hooks'

import styles from './DashboardLendTab.module.less'

const DashboardLendTab = () => {
  const { connected } = useWallet()

  const { data: lenderStats } = useLenderStats()

  const { marketsPreview, searchSelectParams } = useDashboardLendTab()

  return (
    <>
      <div className={classNames(styles.collectionsSection, { [styles.fullWidth]: !connected })}>
        <SearchableHeading title="Collections" searchSelectParams={searchSelectParams} />
        <CollectionsCardList marketsPreview={marketsPreview} />
      </div>
      {connected && (
        <div className={styles.additionalContentSection}>
          <AllocationBlock stats={lenderStats?.allocation} />
          <AllTimeBlock stats={lenderStats?.allTime} />
        </div>
      )}
    </>
  )
}

export default DashboardLendTab
