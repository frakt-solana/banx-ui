import { FC, useState } from 'react'

import classNames from 'classnames'

import { checkIsEditMode } from '@banx/components/PlaceOfferSection'
import PlaceOfferSection from '@banx/components/PlaceOfferSection/PlaceOfferSection'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { toLowerCaseNoSpaces, trackPageEvent } from '@banx/utils'

import ActivityTable from '../ActivityTable'
import OrderBook from '../OrderBook'

import styles from './ExpandableCardContent.module.less'

interface TabsComponents {
  [key: string]: JSX.Element
}

interface ExpandableCardContentProps {
  marketPubkey: string
}

const ExpandableCardContent: FC<ExpandableCardContentProps> = ({ marketPubkey }) => {
  const [offerPubkey, setOfferPubkey] = useState('')

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: BONDS_TABS,
    defaultValue: BONDS_TABS[1].value,
  })

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('lend', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  const TABS_COMPONENTS: TabsComponents = {
    [TabName.OFFERS]: (
      <OrderBook
        marketPubkey={marketPubkey}
        offerPubkey={offerPubkey}
        setOfferPubkey={setOfferPubkey}
      />
    ),
    [TabName.ACTIVITY]: <ActivityTable marketPubkey={marketPubkey} />,
  }

  return (
    <div
      className={classNames(styles.container, {
        [styles.isEditMode]: checkIsEditMode(offerPubkey),
      })}
    >
      <PlaceOfferSection
        setOfferPubkey={setOfferPubkey}
        offerPubkey={offerPubkey}
        marketPubkey={marketPubkey}
      />
      <div className={styles.content}>
        <Tabs value={currentTabValue} onTabClick={onTabClick} {...tabsProps} />
        {TABS_COMPONENTS[currentTabValue]}
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
