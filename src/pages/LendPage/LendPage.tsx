import { Tabs, useTabs } from '@banx/components/Tabs'

import InstantLoansContent from './InstantLendContent'
import PlaceOffersContent from './PlaceOffersContent'
import LendHeader from './PlaceOffersContent/components/LendHeader'

import styles from './LendPage.module.less'

export const LendPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: LendTabName.INSTANT,
  })

  return (
    <div className={styles.pageWrapper}>
      <LendHeader />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === LendTabName.INSTANT && <InstantLoansContent />}
      {currentTabValue === LendTabName.PLACE && <PlaceOffersContent />}
    </div>
  )
}

enum LendTabName {
  INSTANT = 'instant',
  PLACE = 'place',
}

const OFFERS_TABS = [
  {
    label: 'Lend instantly',
    value: LendTabName.INSTANT,
  },
  {
    label: 'Place offers',
    value: LendTabName.PLACE,
  },
]
