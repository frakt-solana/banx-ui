import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { toLowerCaseNoSpaces, trackPageEvent, useMixpanelLocationTrack } from '@banx/utils'

import { LoansActiveTable } from './components/LoansActiveTable'
import LoansHeader from './components/LoansHeader'
import { LoansHistoryTable } from './components/LoansHistoryTable'
import { DEFAULT_TAB_VALUE, LOANS_TABS, LoansTabsNames } from './constants'
import { useWalletLoansAndOffers } from './hooks'

import styles from './LoansPage.module.less'

export const LoansPage = () => {
  useMixpanelLocationTrack('myloans')

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: LOANS_TABS,
    defaultValue: DEFAULT_TAB_VALUE,
  })

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('myloans', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  const { loans, offers, isLoading } = useWalletLoansAndOffers()

  return (
    <div className={styles.pageWrapper}>
      <LoansHeader loans={loans} />
      <Tabs value={currentTabValue} {...tabProps} onTabClick={onTabClick} />
      {currentTabValue === LoansTabsNames.ACTIVE && (
        <LoansActiveTable loans={loans} isLoading={isLoading} offers={offers} />
      )}
      {currentTabValue === LoansTabsNames.HISTORY && <LoansHistoryTable />}
    </div>
  )
}
