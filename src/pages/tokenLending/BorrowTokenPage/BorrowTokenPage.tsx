import { useEffect } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import BorrowHeader from './BorrowHeader'
import InstantBorrowContent from './InstantBorrowContent'
import ListLoansContent from './ListLoansContent'
import { useBorrowTokenTabs } from './hooks'

import styles from './BorrowTokenPage.module.less'

export const BorrowTokenPage = () => {
  //? Used to set default tab when user is redirected to BorrowTokenPage.
  const { tab: storeTab, setTab } = useBorrowTokenTabs()

  const {
    value: currentTabValue,
    setValue,
    tabs,
  } = useTabs({
    tabs: BORROW_TABS,
    defaultValue: storeTab ?? BorrowTokenTabName.INSTANT,
  })

  //? Used hook to reset store when the component is unmounted
  useEffect(() => {
    if (!storeTab) return

    return () => setTab(null)
  }, [setTab, storeTab])

  return (
    <>
      <BorrowHeader />
      <Tabs value={currentTabValue} tabs={tabs} setValue={setValue} />
      <div className={styles.content}>
        {currentTabValue === BorrowTokenTabName.INSTANT && <InstantBorrowContent />}
        {currentTabValue === BorrowTokenTabName.LIST && <ListLoansContent />}
      </div>
    </>
  )
}

export enum BorrowTokenTabName {
  INSTANT = 'instant',
  LIST = 'list',
}

const BORROW_TABS: Tab[] = [
  {
    label: 'Borrow now',
    value: BorrowTokenTabName.INSTANT,
  },
  {
    label: 'List loans',
    value: BorrowTokenTabName.LIST,
  },
]
