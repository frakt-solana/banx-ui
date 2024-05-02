import { useEffect } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import BorrowHeader from './BorrowHeader'
import { InstantLoansContent } from './InstantLoansContent'
import { RequestLoansContent } from './RequestLoansContent'
import { useBorrowTabs } from './hooks'

import styles from './BorrowPage.module.less'

export const BorrowPage = () => {
  //? Used to set default tab when user is redirected to BorrowPage.
  const { tab: storeTab, setTab } = useBorrowTabs()

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: storeTab ?? BorrowTabName.INSTANT,
  })

  //? Used hook to reset store when the component is unmounted
  useEffect(() => {
    if (!storeTab) return

    return () => setTab(null)
  }, [setTab, storeTab])

  return (
    <div className={styles.pageWrapper}>
      <BorrowHeader />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === BorrowTabName.INSTANT && <InstantLoansContent />}
      {currentTabValue === BorrowTabName.REQUEST && <RequestLoansContent />}
    </div>
  )
}

export enum BorrowTabName {
  INSTANT = 'instant',
  REQUEST = 'request',
}

const OFFERS_TABS: Tab[] = [
  {
    label: 'Instant loans',
    value: BorrowTabName.INSTANT,
  },
  {
    label: 'Request loans',
    value: BorrowTabName.REQUEST,
  },
]
