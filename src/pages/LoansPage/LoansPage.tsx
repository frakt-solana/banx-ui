import { Tabs, useTabs } from '@banx/components/Tabs'

import { LoansActiveTable } from './components/LoansActiveTable'
import LoansHeader from './components/LoansHeader'
import { LoansHistoryTable } from './components/LoansHistoryTable'
import { RequestsTable } from './components/RequestLoansTable'
import { LOANS_TABS, LoansTabsNames } from './constants'
import { useWalletLoansAndOffers } from './hooks'

import styles from './LoansPage.module.less'

export const LoansPage = () => {
  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: LOANS_TABS,
    defaultValue: LoansTabsNames.REQUESTS,
  })

  const { loans, offers, isLoading } = useWalletLoansAndOffers()

  return (
    <div className={styles.pageWrapper}>
      <LoansHeader loans={loans} />
      <Tabs value={currentTabValue} {...tabProps} />
      {currentTabValue === LoansTabsNames.REQUESTS && <RequestsTable />}

      {currentTabValue === LoansTabsNames.LOANS && (
        <LoansActiveTable loans={loans} isLoading={isLoading} offers={offers} />
      )}

      {currentTabValue === LoansTabsNames.HISTORY && <LoansHistoryTable />}
    </div>
  )
}
