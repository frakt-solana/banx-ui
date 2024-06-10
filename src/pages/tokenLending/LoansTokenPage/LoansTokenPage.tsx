import { useEffect } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import LoansHeader from './LoansHeader'
import { useLoansTokenTabs } from './hooks'

import styles from './LoansTokenPage.module.less'

export const LoansTokenPage = () => {
  //? Used to set default tab when user is redirected to LoansTokenPage.
  const { tab: storeTab, setTab } = useLoansTokenTabs()

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: LOANS_TABS,
    defaultValue: storeTab ?? LoansTokenTabsName.LOANS,
  })

  //? Used hook to reset store when the component is unmounted
  useEffect(() => {
    if (!storeTab) return

    return () => setTab(null)
  }, [setTab, storeTab])

  return (
    <div className={styles.pageWrapper}>
      <LoansHeader />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === LoansTokenTabsName.LOANS && <></>}
      {currentTabValue === LoansTokenTabsName.REQUESTS && <></>}
      {currentTabValue === LoansTokenTabsName.HISTORY && <></>}
    </div>
  )
}

export enum LoansTokenTabsName {
  REQUESTS = 'requests',
  LOANS = 'loans',
  HISTORY = 'history',
}

const LOANS_TABS: Tab[] = [
  {
    label: 'Loans',
    value: LoansTokenTabsName.LOANS,
  },
  {
    label: 'Listings',
    value: LoansTokenTabsName.REQUESTS,
  },
  {
    label: 'History',
    value: LoansTokenTabsName.HISTORY,
  },
]
