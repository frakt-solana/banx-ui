import { FC, useState } from 'react'

import classNames from 'classnames'

import { checkIsEditMode } from '@banx/components/PlaceOfferSection'
import PlaceOfferSection from '@banx/components/PlaceOfferSection/PlaceOfferSection'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { toLowerCaseNoSpaces, trackPageEvent } from '@banx/utils'

import ActivityTable from '../ActivityTable'
import OrderBook from '../OrderBook'

import styles from './ExpandableCardContent.module.less'

enum TabName {
  OFFER = 'offer',
  ACTIVITY = 'activity',
}

interface TabsComponents {
  [key: string]: JSX.Element
}

interface ExpandableCardContentProps {
  marketPubkey: string
  isOrderBookVisible: boolean
}

const ExpandableCardContent: FC<ExpandableCardContentProps> = ({
  marketPubkey,
  isOrderBookVisible,
}) => {
  const [offerPubkey, setOfferPubkey] = useState('')

  const {
    value: currentTabValue,
    setValue: setTabValue,
    ...tabsProps
  } = useTabs({ tabs: BONDS_TABS, defaultValue: BONDS_TABS[1].value })

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('lend', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  const goToPlaceOfferTab = () => {
    setTabValue(BONDS_TABS[1].value)
  }

  const TABS_COMPONENTS: TabsComponents = {
    [TabName.OFFER]: (
      <PlaceOfferSection
        setOfferPubkey={setOfferPubkey}
        offerPubkey={offerPubkey}
        marketPubkey={marketPubkey}
      />
    ),
    [TabName.ACTIVITY]: (
      <ActivityTable marketPubkey={marketPubkey} goToPlaceOfferTab={goToPlaceOfferTab} />
    ),
  }

  return (
    <div
      className={classNames(styles.container, {
        [styles.isEditMode]: checkIsEditMode(offerPubkey),
      })}
    >
      <div className={styles.content}>
        <Tabs
          value={currentTabValue}
          onTabClick={onTabClick}
          setValue={setTabValue}
          {...tabsProps}
        />
        {TABS_COMPONENTS[currentTabValue]}
      </div>
      {isOrderBookVisible && (
        <OrderBook
          marketPubkey={marketPubkey}
          offerPubkey={offerPubkey}
          setOfferPubkey={setOfferPubkey}
          goToPlaceOfferTab={goToPlaceOfferTab}
        />
      )}
    </div>
  )
}

export default ExpandableCardContent

const BONDS_TABS = [
  {
    label: 'Activity',
    value: 'activity',
  },
  {
    label: 'Place offer',
    value: 'offer',
  },
]
