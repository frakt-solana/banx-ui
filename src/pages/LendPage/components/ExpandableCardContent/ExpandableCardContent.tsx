import { FC, useEffect } from 'react'

import { Tabs, useTabs } from '@banx/components/Tabs'

import ActivityTab from '../ActivityTab'
import OrderBook from '../OrderBook'
import PlaceOfferTab from '../PlaceOfferTab'
import { BONDS_TABS, DEFAULT_TAB } from './constants'
import { useOfferStore } from './hooks'

import styles from './ExpandableCardContent.module.less'

enum TabsNames {
  OFFER = 'offer',
  ACTIVITY = 'activity',
}

interface TabsComponents {
  [key: string]: JSX.Element
}

interface ExpandableCardContentProps {
  marketPubkey: string
  visibleOrderBook: boolean
}

const ExpandableCardContent: FC<ExpandableCardContentProps> = ({
  marketPubkey,
  visibleOrderBook,
}) => {
  const { offerPubkey } = useOfferStore()

  const {
    tabs: bondTabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({ tabs: BONDS_TABS, defaultValue: DEFAULT_TAB })

  useEffect(() => {
    if (offerPubkey) {
      setTabValue(DEFAULT_TAB)
    }
  }, [offerPubkey, setTabValue])

  const tabsComponents: TabsComponents = {
    [TabsNames.OFFER]: <PlaceOfferTab marketPubkey={marketPubkey} />,
    [TabsNames.ACTIVITY]: <ActivityTab marketPubkey={marketPubkey} />,
  }

  return (
    <div className={styles.content}>
      <div className={styles.tabsContentWrapper}>
        <Tabs tabs={bondTabs} value={tabValue} setValue={setTabValue} />
        <div className={styles.tabContent}>{tabsComponents[tabValue]}</div>
      </div>
      {visibleOrderBook && <OrderBook marketPubkey={marketPubkey} />}
    </div>
  )
}

export default ExpandableCardContent
