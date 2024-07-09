import React from 'react'

import PlaceTokenOfferSection from '@banx/components/PlaceTokenOfferSection'
import { Tabs, useTabs } from '@banx/components/Tabs'

interface ExpandedCardContentProps {
  marketPubkey: string
  offerPubkey: string
}

const ExpandedCardContent: React.FC<ExpandedCardContentProps> = ({ marketPubkey, offerPubkey }) => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.OFFER,
  })

  return (
    <>
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === TabName.OFFER && (
        <PlaceTokenOfferSection marketPubkey={marketPubkey} offerPubkey={offerPubkey} />
      )}
      {currentTabValue === TabName.ACTIVITY && <></>}
    </>
  )
}

export default ExpandedCardContent

export enum TabName {
  OFFER = 'offer',
  ACTIVITY = 'activity',
}

export const TABS = [
  {
    label: 'Offer',
    value: TabName.OFFER,
  },
  {
    label: 'Activity',
    value: TabName.ACTIVITY,
  },
]
