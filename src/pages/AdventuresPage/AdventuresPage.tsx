import { FC } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { AdventuresList } from './components/AdventuresList'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { useAdventuresInfo } from './hooks'

import styles from './AdventuresPage.module.less'

export const AdventuresPage: FC = () => {
  const { adventuresInfo, isLoading } = useAdventuresInfo()

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: ADVENTURES_TABS,
    defaultValue: ADVENTURES_TABS[0].value,
  })

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

enum AdventuresTabsNames {
  ADVENTURES = 'adventures',
  HISTORY = 'history',
}

const ADVENTURES_TABS: Tab[] = [
  {
    label: 'Adventures',
    value: 'adventures',
  },
  {
    label: 'History',
    value: 'history',
  },
]
