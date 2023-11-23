import { FC } from 'react'

import classNames from 'classnames'

import { Tabs } from '@banx/components/Tabs'

import ActivityTable from '../ActivityTable'
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
  const { marketParams, tabsParams, goToPlaceOfferTab, isEditMode } =
    useExpandableCardContent(marketPubkey)

  const TABS_COMPONENTS: TabsComponents = {
    [TabName.OFFER]: <PlaceOfferTab {...marketParams} />,
    [TabName.ACTIVITY]: (
      <ActivityTable marketPubkey={marketPubkey} goToPlaceOfferTab={goToPlaceOfferTab} />
    ),
  }

  return (
    <div className={classNames(styles.container, { [styles.isEditMode]: isEditMode })}>
      <div className={styles.content}>
        <Tabs {...tabsParams} />
        {TABS_COMPONENTS[tabsParams.value]}
      </div>
      {isOrderBookVisible && <OrderBook {...marketParams} />}
    </div>
  )
}

export default ExpandableCardContent
