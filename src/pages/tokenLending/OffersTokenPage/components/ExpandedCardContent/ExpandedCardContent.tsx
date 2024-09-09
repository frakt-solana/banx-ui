import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { LendTokenActivityTable } from '@banx/components/CommonTables'
import PlaceTokenOfferSection from '@banx/components/PlaceTokenOfferSection'
import OrderBook from '@banx/components/PlaceTokenOfferSection/components/OrderBook'
import { Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { TokenMarketPreview } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'

import styles from './ExpandedCardContent.module.less'

interface ExpandedCardContentProps {
  market: TokenMarketPreview
  offerPubkey: string
}

const ExpandedCardContent: FC<ExpandedCardContentProps> = ({ market, offerPubkey }) => {
  const { open: openModal } = useModal()

  const showModal = () => {
    openModal(OffersModal, { market, offerPubkey })
  }

  return (
    <div className={styles.container}>
      <div className={styles.placeOfferContainer}>
        <Button
          className={styles.showOffersMobileButton}
          onClick={showModal}
          type="circle"
          variant="tertiary"
        >
          See offers
        </Button>

        <PlaceTokenOfferSection marketPubkey={market.marketPubkey} offerPubkey={offerPubkey} />
      </div>

      <div className={styles.tabsContent}>
        <TabsContent market={market} offerPubkey={offerPubkey} />
      </div>
    </div>
  )
}

export default ExpandedCardContent

interface TabsContent extends ExpandedCardContentProps {}
const TabsContent: FC<TabsContent> = ({ market, offerPubkey }) => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.OFFER,
  })

  return (
    <>
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === TabName.OFFER && <OrderBook market={market} offerPubkey={offerPubkey} />}
      {currentTabValue === TabName.ACTIVITY && (
        <LendTokenActivityTable marketPubkey={market.marketPubkey} />
      )}
    </>
  )
}

interface OffersModal extends ExpandedCardContentProps {}
const OffersModal: FC<OffersModal> = (props) => {
  const { close } = useModal()

  return (
    <Modal className={styles.modal} open onCancel={close}>
      <TabsContent {...props} />
    </Modal>
  )
}

export enum TabName {
  OFFER = 'offer',
  ACTIVITY = 'activity',
}

export const TABS = [
  {
    label: 'Offer',
    value: TabName.OFFER,
  },
  {
    label: 'Activity',
    value: TabName.ACTIVITY,
  },
]
