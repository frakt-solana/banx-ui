import { useEffect } from 'react'

import { Tabs, useTabs } from '@banx/components/Tabs'

import InstantLoansContent from './InstantLendContent'
import PlaceOffersContent from './PlaceOffersContent'
import LendHeader from './PlaceOffersContent/components/LendHeader'
import { useLendTabs } from './hooks'

import styles from './LendPage.module.less'

export const LendPage = () => {
  //? Used to set default tab when user is redirected to LendPage.
  const { tab: storeTab, setTab } = useLendTabs()

  const {
    value: currentTabValue,
    setValue,
    tabs,
  } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: storeTab ?? LendTabName.PLACE,
  })

  //? Used hook to reset store when the component is unmounted
  useEffect(() => {
    if (!storeTab) return

    return () => setTab(null)
  }, [setTab, storeTab])

  const goToPlaceOfferTab = () => {
    setValue(LendTabName.PLACE)
  }

  return (
    <div className={styles.pageWrapper}>
      <LendHeader />
      <Tabs value={currentTabValue} tabs={tabs} setValue={setValue} />
      {currentTabValue === LendTabName.INSTANT && (
        <InstantLoansContent goToPlaceOfferTab={goToPlaceOfferTab} />
      )}
      {currentTabValue === LendTabName.PLACE && <PlaceOffersContent />}
    </div>
  )
}

export enum LendTabName {
  INSTANT = 'instant',
  PLACE = 'place',
}

const OFFERS_TABS = [
  {
    label: 'Place offers',
    value: LendTabName.PLACE,
  },
  {
    label: 'Lend now',
    value: LendTabName.INSTANT,
  },
]
