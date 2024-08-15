import Checkbox from '@banx/components/Checkbox'
import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { Offer } from '@banx/api/nft'
import { calculateIdleFundsInOffer } from '@banx/utils'

import { OfferOptimistic } from '../hooks/useSelectedOffers'

import styles from './OrderBook.module.less'

type GetTableColumns = (props: {
  onSelectAll: () => void
  findOfferInSelection: (offerPubkey: string) => OfferOptimistic | null
  toggleOfferInSelection: (offer: Offer) => void
  hasSelectedOffers: boolean
}) => ColumnType<Offer>[]

export const getTableColumns: GetTableColumns = ({
  onSelectAll,
  findOfferInSelection,
  toggleOfferInSelection,
  hasSelectedOffers,
}) => {
  const columns: ColumnType<Offer>[] = [
    {
      key: 'borrow',
      title: (
        <div className={styles.checkboxRow}>
          <Checkbox
            className={styles.checkbox}
            onChange={onSelectAll}
            checked={hasSelectedOffers}
          />
          <HeaderCell label="To borrow" />
        </div>
      ),
      render: (offer) => (
        <div className={styles.checkboxRow}>
          <Checkbox
            className={styles.checkbox}
            onChange={() => toggleOfferInSelection(offer)}
            checked={!!findOfferInSelection(offer.publicKey)}
          />
          <DisplayValue value={calculateIdleFundsInOffer(offer).toNumber()} />
        </div>
      ),
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: () => createPercentValueJSX(MAX_APR_VALUE),
    },
    {
      key: 'offerSize',
      title: <HeaderCell label="Offer size" />,
      render: (offer) => <DisplayValue value={calculateIdleFundsInOffer(offer).toNumber()} />,
    },
  ]

  return columns
}
