import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { useMixpanelLocationTrack } from '@banx/utils'

import BorrowHeader from './BorrowHeader'
import { InstantLoansContent } from './InstantLoansContent'

import styles from './BorrowPage.module.less'

export const BorrowPage = () => {
  useMixpanelLocationTrack('borrow')

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: BorrowTabName.INSTANT,
  })

  return (
    <div className={styles.pageWrapper}>
      <BorrowHeader />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === BorrowTabName.INSTANT && <InstantLoansContent />}
      {currentTabValue === BorrowTabName.REQUEST && <div>Request loans content here</div>}
    </div>
  )
}

enum BorrowTabName {
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
