import { FC, useState } from 'react'

import PlaceOfferSection from '@banx/components/PlaceOfferSection/PlaceOfferSection'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { toLowerCaseNoSpaces, trackPageEvent } from '@banx/utils'

import ActivityTable from '../ActivityTable'
import OrderBook from '../OrderBook'

import styles from './ExpandableCardContent.module.less'

interface ExpandableCardContentProps {
  marketPubkey: string
}

const ExpandableCardContent: FC<ExpandableCardContentProps> = ({ marketPubkey }) => {
  const [offerPubkey, setOfferPubkey] = useState('')

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: BONDS_TABS,
    defaultValue: BONDS_TABS[0].value,
  })

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('lend', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  return (
    <div className={styles.container}>
      <PlaceOfferSection
        setOfferPubkey={setOfferPubkey}
        offerPubkey={offerPubkey}
        marketPubkey={marketPubkey}
      />
      <div className={styles.content}>
        <Tabs value={currentTabValue} onTabClick={onTabClick} {...tabsProps} />
        {currentTabValue === TabName.OFFERS && (
          <OrderBook
            marketPubkey={marketPubkey}
            offerPubkey={offerPubkey}
            setOfferPubkey={setOfferPubkey}
          />
        )}
        {currentTabValue === TabName.ACTIVITY && <ActivityTable marketPubkey={marketPubkey} />}
      </div>
    </div>
  )
}

export default ExpandableCardContent

enum TabName {
  OFFERS = 'offers',
  ACTIVITY = 'activity',
}

const BONDS_TABS = [
  {
    label: 'Offers',
    value: TabName.OFFERS,
  },
  {
    label: 'Activity',
    value: TabName.ACTIVITY,
  },
]
