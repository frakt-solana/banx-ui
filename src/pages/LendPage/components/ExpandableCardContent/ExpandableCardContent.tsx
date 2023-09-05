import { FC, useEffect } from 'react'

import { Tabs, useTabs } from '@banx/components/Tabs'

import ActivityTable from '../ActivityTable'
import OrderBook from '../OrderBook'
import PlaceOfferTab from '../PlaceOfferTab'
import { BONDS_TABS, DEFAULT_TAB } from './constants'
import { useOfferStore } from './hooks'

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

  const TABS_COMPONENTS: TabsComponents = {
    [TabName.OFFER]: <PlaceOfferTab marketPubkey={marketPubkey} />,
    [TabName.ACTIVITY]: <ActivityTable marketPubkey={marketPubkey} />,
  }

  return (
    <div className={styles.content}>
      <div className={styles.tabsContentWrapper}>
        <Tabs tabs={bondTabs} value={tabValue} setValue={setTabValue} />
        <div className={styles.tabContent}>{TABS_COMPONENTS[tabValue]}</div>
      </div>
      {isOrderBookVisible && <OrderBook marketPubkey={marketPubkey} />}
    </div>
  )
}

export default ExpandableCardContent
