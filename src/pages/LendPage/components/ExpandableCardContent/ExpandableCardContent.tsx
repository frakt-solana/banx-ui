import { FC } from 'react'

import { Tabs } from '@banx/components/Tabs'

import ActivityTab from '../ActivityTab'
import OrderBook from '../OrderBook'
import PlaceOfferTab from '../PlaceOfferTab'
import { useExpandableCardContent } from './hooks'

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
  const { marketParams, tabsParams } = useExpandableCardContent(marketPubkey)

  const TABS_COMPONENTS: TabsComponents = {
    [TabName.OFFER]: <PlaceOfferTab {...marketParams} />,
    [TabName.ACTIVITY]: <ActivityTab marketPubkey={marketPubkey} />,
  }

  return (
    <div className={styles.content}>
      <div className={styles.tabsContentWrapper}>
        <Tabs {...tabsParams} />
        <div className={styles.tabContent}>{TABS_COMPONENTS[tabsParams.value]}</div>
      </div>
      {isOrderBookVisible && <OrderBook {...marketParams} />}
    </div>
  )
}

export default ExpandableCardContent
