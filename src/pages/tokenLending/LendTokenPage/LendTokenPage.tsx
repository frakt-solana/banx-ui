import { useEffect } from 'react'

import { Tabs, useTabs } from '@banx/components/Tabs'

import InstantLendTokenTable from './InstantLendTokenTable'
import LendHeader from './LendHeader'
import PlaceTokenOffers from './PlaceTokenOffers'
import { useLendTokenTabs } from './hooks'

import styles from './LendTokenPage.module.less'

export const LendTokenPage = () => {
  //? Used to set default tab when user is redirected to LendTokenPage.
  const { tab: storeTab, setTab } = useLendTokenTabs()

  const {
    value: currentTabValue,
    setValue,
    tabs,
  } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: storeTab ?? LendTokenTabName.PLACE,
  })

  //? Used hook to reset store when the component is unmounted
  useEffect(() => {
    if (!storeTab) return

    return () => setTab(null)
  }, [setTab, storeTab])

  const goToPlaceOfferTab = () => {
    setValue(LendTokenTabName.PLACE)
  }

  return (
    <div className={styles.pageWrapper}>
      <LendHeader />
      <Tabs value={currentTabValue} tabs={tabs} setValue={setValue} />
      {currentTabValue === LendTokenTabName.INSTANT && (
        <InstantLendTokenTable goToPlaceOfferTab={goToPlaceOfferTab} />
      )}
      {currentTabValue === LendTokenTabName.PLACE && <PlaceTokenOffers />}
    </div>
  )
}

export enum LendTokenTabName {
  INSTANT = 'instant',
  PLACE = 'place',
}

const OFFERS_TABS = [
  {
    label: 'Place offers',
    value: LendTokenTabName.PLACE,
  },
  {
    label: 'Lend now',
    value: LendTokenTabName.INSTANT,
  },
]
