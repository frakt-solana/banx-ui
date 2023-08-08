import { Tabs } from '@banx/components/Tabs'

import OrderBook from '../OrderBook'
import PlaceOfferTab from '../PlaceOfferTab'
import { useExpandableCardContent } from './hooks'

import styles from './ExpandableCardContent.module.less'

enum TabsNames {
  OFFER = 'offer',
  Activity = 'activity',
}

interface TabsComponents {
  [key: string]: JSX.Element
}

const ExpandableCardContent = () => {
  const { tabsParams } = useExpandableCardContent()

  const tabsComponents: TabsComponents = {
    [TabsNames.OFFER]: <PlaceOfferTab />,
  }

  return (
    <div className={styles.content}>
      <div className={styles.tabsContentWrapper}>
        <Tabs {...tabsParams} />
        <div className={styles.tabContent}>{tabsComponents[tabsParams.value]}</div>
      </div>
      <OrderBook />
    </div>
  )
}

export default ExpandableCardContent
