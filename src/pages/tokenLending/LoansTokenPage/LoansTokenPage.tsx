import { useEffect } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import BorrowerTokenActivityTable from './BorrowerTokenActivityTable'
import LoansHeader from './LoansHeader'
import TokenLoansContent from './TokenLoansContent'
import { useLoansTokenTabs, useWalletTokenLoans } from './hooks'

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

  const { loans, isLoading } = useWalletTokenLoans()

  return (
    <div className={styles.pageWrapper}>
      <LoansHeader loans={loans} />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === LoansTokenTabsName.LOANS && (
        <TokenLoansContent loans={loans} isLoading={isLoading} />
      )}
      {currentTabValue === LoansTokenTabsName.LISTINGS && <></>}
      {currentTabValue === LoansTokenTabsName.HISTORY && <BorrowerTokenActivityTable />}
    </div>
  )
}

export enum LoansTokenTabsName {
  LOANS = 'loans',
  LISTINGS = 'listings',
  HISTORY = 'history',
}

const LOANS_TABS: Tab[] = [
  {
    label: 'Loans',
    value: LoansTokenTabsName.LOANS,
  },
  {
    label: 'Listings',
    value: LoansTokenTabsName.LISTINGS,
    disabled: true,
  },
  {
    label: 'History',
    value: LoansTokenTabsName.HISTORY,
  },
]
