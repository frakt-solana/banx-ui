import { FC, useState } from 'react'

import PlaceOfferSection from '@banx/components/PlaceOfferSection/PlaceOfferSection'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { useModal } from '@banx/store'
import { toLowerCaseNoSpaces, trackPageEvent } from '@banx/utils'

import ActivityTable from '../ActivityTable'
import OrderBook from '../OrderBook'

import styles from './ExpandableCardContent.module.less'

interface ExpandableCardContentProps {
  marketPubkey: string
}

const ExpandableCardContent: FC<ExpandableCardContentProps> = ({ marketPubkey }) => {
  const [offerPubkey, setOfferPubkey] = useState('')
  // const { open } = useModal()

  // const showModal = () => {
  //   open(OffersModal, { setOfferPubkey, offerPubkey, marketPubkey })
  // }

  return (
    <div className={styles.container}>
      <PlaceOfferSection
        offerPubkey={offerPubkey}
        marketPubkey={marketPubkey}
        setOfferPubkey={setOfferPubkey}
      />

      <div className={styles.content}>
        <TabsContent
          marketPubkey={marketPubkey}
          offerPubkey={offerPubkey}
          setOfferPubkey={setOfferPubkey}
        />
      </div>
    </div>
  )
}

export default ExpandableCardContent

interface MarketParams {
  marketPubkey: string
  offerPubkey: string
  setOfferPubkey: (offerPubkey: string) => void
}

const TabsContent = ({ marketPubkey, offerPubkey, setOfferPubkey }: MarketParams) => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: BONDS_TABS,
    defaultValue: BONDS_TABS[0].value,
  })

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('lend', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  return (
    <>
      <Tabs value={currentTabValue} onTabClick={onTabClick} {...tabsProps} />
      {currentTabValue === TabName.OFFERS && (
        <OrderBook
          marketPubkey={marketPubkey}
          offerPubkey={offerPubkey}
          setOfferPubkey={setOfferPubkey}
        />
      )}
      {currentTabValue === TabName.ACTIVITY && <ActivityTable marketPubkey={marketPubkey} />}
    </>
  )
}

export const OffersModal: FC<MarketParams> = (props) => {
  const { close } = useModal()

  return (
    <Modal className={styles.modal} open onCancel={close}>
      <TabsContent {...props} />
    </Modal>
  )
}

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
