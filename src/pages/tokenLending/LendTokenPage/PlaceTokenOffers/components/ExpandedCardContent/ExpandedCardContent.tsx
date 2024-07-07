import { FC } from 'react'

import PlaceTokenOfferSection from '@banx/components/PlaceTokenOfferSection'
import { Tabs, useTabs } from '@banx/components/Tabs'

import LendTokenActivityTable from '../LendTokenActivityTable'

const ExpandedCardContent: FC<{ marketPubkey: string }> = ({ marketPubkey }) => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.OFFERS,
  })

  return (
    <>
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === TabName.OFFERS && <PlaceTokenOfferSection marketPubkey={marketPubkey} />}
      {currentTabValue === TabName.ACTIVITY && (
        <LendTokenActivityTable marketPubkey={marketPubkey} />
      )}
    </>
  )
}

export default ExpandedCardContent

export enum TabName {
  OFFERS = 'offers',
  ACTIVITY = 'activity',
}

export const TABS = [
  {
    label: 'Offers',
    value: TabName.OFFERS,
  },
  {
    label: 'Activity',
    value: TabName.ACTIVITY,
  },
]
