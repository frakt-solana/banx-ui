import { FC } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { AdventuresList } from './components/AdventuresList'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { useAdventuresInfo } from './hooks'

import styles from './AdventuresPage.module.less'

export enum AdventuresTabsNames {
  ADVENTURES = 'adventures',
  HISTORY = 'history',
}

export const ADVENTURES_TABS: Tab[] = [
  {
    label: 'Adventures',
    value: 'adventures',
  },
  {
    label: 'History',
    value: 'history',
  },
]

export const DEFAULT_TAB_VALUE = ADVENTURES_TABS[0].value

export const AdventuresPage: FC = () => {
  const { adventuresInfo, isLoading } = useAdventuresInfo()

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: ADVENTURES_TABS,
    defaultValue: DEFAULT_TAB_VALUE,
  })

  // const walletInfoExists = !!adventuresInfo?.nfts

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.content}>
        <Header />
        {!isLoading && !!adventuresInfo && (
          <>
            <Tabs value={currentTabValue} {...tabProps} />
            <AdventuresList
              className={styles.adventuresList}
              adventuresInfo={adventuresInfo}
              historyMode={currentTabValue === AdventuresTabsNames.HISTORY}
              setNftsModalOpen={() => null}
            />
          </>
        )}
      </div>
      {adventuresInfo?.banxUserPDA && (
        <Sidebar className={styles.sidebar} adventuresInfo={adventuresInfo} />
      )}
    </div>
  )
}
