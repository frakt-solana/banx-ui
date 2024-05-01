import { useEffect } from 'react'

import { Tabs, useTabs } from '@banx/components/Tabs'

import { LoansActiveTable } from './components/LoansActiveTable'
import LoansHeader from './components/LoansHeader'
import { LoansHistoryTable } from './components/LoansHistoryTable'
import { RequestsTable } from './components/RequestLoansTable'
import { LOANS_TABS, LoansTabsNames } from './constants'
import { useLoansTabs, useWalletLoansAndOffers } from './hooks'

import styles from './LoansPage.module.less'

export const LoansPage = () => {
  //? Used to set default tab when user is redirected to LoansPage.
  const { tab: storeTab, setTab } = useLoansTabs()

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: LOANS_TABS,
    defaultValue: storeTab ?? LoansTabsNames.REQUESTS,
  })

  //? Used hook to reset store when the component is unmounted
  useEffect(() => {
    if (!storeTab) return

    return () => setTab(null)
  }, [setTab, storeTab])

  const { loans, offers, isLoading } = useWalletLoansAndOffers()

  return (
    <div className={styles.pageWrapper}>
      <LoansHeader loans={loans} />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === LoansTabsNames.REQUESTS && <RequestsTable />}

      {currentTabValue === LoansTabsNames.LOANS && (
        <LoansActiveTable loans={loans} isLoading={isLoading} offers={offers} />
      )}

      {currentTabValue === LoansTabsNames.HISTORY && <LoansHistoryTable />}
    </div>
  )
}
