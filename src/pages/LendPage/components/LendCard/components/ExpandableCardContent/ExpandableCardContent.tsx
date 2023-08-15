import { FC } from 'react'

import { Tabs } from '@banx/components/Tabs'

import ActivityTab from '../ActivityTab'
import OrderBook from '../OrderBook'
import PlaceOfferTab from '../PlaceOfferTab'
import { useExpandableCardContent } from './hooks'

import styles from './ExpandableCardContent.module.less'

enum TabsNames {
  OFFER = 'offer',
  ACTIVITY = 'activity',
}

interface TabsComponents {
  [key: string]: JSX.Element
}

const ExpandableCardContent: FC<{ marketPubkey: string }> = ({ marketPubkey }) => {
  const { tabsParams } = useExpandableCardContent()

  const tabsComponents: TabsComponents = {
    [TabsNames.OFFER]: <PlaceOfferTab marketPubkey={marketPubkey} />,
    [TabsNames.ACTIVITY]: <ActivityTab marketPubkey={marketPubkey} />,
  }

  return (
    <div className={styles.content}>
      <div className={styles.tabsContentWrapper}>
        <Tabs {...tabsParams} />
        <div className={styles.tabContent}>{tabsComponents[tabsParams.value]}</div>
      </div>
      <OrderBook marketPubkey={marketPubkey} />
    </div>
  )
}

export default ExpandableCardContent
