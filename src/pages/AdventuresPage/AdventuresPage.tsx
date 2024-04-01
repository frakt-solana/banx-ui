import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { AdventuresList, Header, Sidebar } from './components'
import { useBanxStakeInfo, useBanxStakeSettings } from './hooks'

import styles from './AdventuresPage.module.less'

export const AdventuresPage: FC = () => {
  const { connected } = useWallet()
  const { banxStakeSettings, isLoading: isBanxStakeSettingsLoading } = useBanxStakeSettings()
  const { banxStakeInfo, isLoading: isBanxTokenStakeLoading } = useBanxStakeInfo()

  const isLoading = isBanxStakeSettingsLoading || isBanxTokenStakeLoading
  const isDataReady = !!banxStakeInfo && !!banxStakeSettings

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: ADVENTURES_TABS,
    defaultValue: ADVENTURES_TABS[0].value,
  })

  return (
    <div className={styles.pageWrapper}>
      <div className={classNames(styles.content, styles.active)}>
        <Header />
        {isLoading && <Loader className={styles.loader} />}
        {isDataReady && (
          <>
            <Tabs value={currentTabValue} {...tabProps} />
            <AdventuresList
              banxStakeInfo={banxStakeInfo}
              historyMode={currentTabValue === AdventureTab.HISTORY}
              className={styles.adventuresList}
            />
          </>
        )}
      </div>

      {connected && isDataReady && (
        <Sidebar
          banxStakeInfo={banxStakeInfo}
          banxStakingSettings={banxStakeSettings}
          className={styles.sidebar}
        />
      )}
    </div>
  )
}

enum AdventureTab {
  ADVENTURES = 'adventures',
  HISTORY = 'history',
}

const ADVENTURES_TABS: Tab[] = [
  {
    label: 'Adventures',
    value: AdventureTab.ADVENTURES,
  },
  {
    label: 'History',
    value: AdventureTab.HISTORY,
  },
]
