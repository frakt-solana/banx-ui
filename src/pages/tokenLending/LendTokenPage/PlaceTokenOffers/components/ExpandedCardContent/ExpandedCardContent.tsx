import { FC, useState } from 'react'

import PlaceTokenOfferSection from '@banx/components/PlaceTokenOfferSection'
import { Tabs, useTabs } from '@banx/components/Tabs'

import { TABS, TabName } from './constants'

import styles from './ExpandedCardContent.module.less'

const ExpandedCardContent: FC<{ marketPubkey: string }> = ({ marketPubkey }) => {
  const [offerPubkey, setOfferPubkey] = useState('')

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.OFFERS,
  })

  return (
    <div className={styles.container}>
      <div className={styles.tabsContent}>
        <Tabs value={currentTabValue} {...tabsProps} />
        {currentTabValue === TabName.OFFERS && (
          <PlaceTokenOfferSection marketPubkey={marketPubkey} offerPubkey={offerPubkey} />
        )}
        {currentTabValue === TabName.ACTIVITY && <></>}
      </div>
    </div>
  )
}

export default ExpandedCardContent
