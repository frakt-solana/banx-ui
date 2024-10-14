import { useEffect } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import BorrowerTokenActivityTable from './BorrowerTokenActivityTable'
import LoansHeader from './LoansHeader'
import TokenLoanListingsTable from './TokenLoanListingsTable'
import TokenLoansContent from './TokenLoansContent'
import { useTokenLoansTabs, useWalletTokenLoans } from './hooks'

import styles from './LoansTokenPage.module.less'

export const LoansTokenPage = () => {
  //? Used to set default tab when user is redirected to LoansTokenPage.
  const { tab: storeTab, setTab } = useTokenLoansTabs()

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: LOANS_TABS,
    defaultValue: storeTab ?? TokenLoanListingsTabName.LOANS,
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
      {currentTabValue === TokenLoanListingsTabName.LOANS && (
        <TokenLoansContent loans={loans} isLoading={isLoading} />
      )}
      {currentTabValue === TokenLoanListingsTabName.LISTINGS && <TokenLoanListingsTable />}
      {currentTabValue === TokenLoanListingsTabName.HISTORY && <BorrowerTokenActivityTable />}
    </div>
  )
}

export enum TokenLoanListingsTabName {
  LOANS = 'loans',
  LISTINGS = 'listings',
  HISTORY = 'history',
}

const LOANS_TABS: Tab[] = [
  {
    label: 'Loans',
    value: TokenLoanListingsTabName.LOANS,
  },
  {
    label: 'Listings',
    value: TokenLoanListingsTabName.LISTINGS,
  },
  {
    label: 'History',
    value: TokenLoanListingsTabName.HISTORY,
  },
]
