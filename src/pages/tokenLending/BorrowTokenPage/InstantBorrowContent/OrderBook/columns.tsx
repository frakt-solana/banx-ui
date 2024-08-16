import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { BorrowOffer } from '@banx/api/tokens'

import { OfferOptimistic } from '../hooks/useSelectedOffers'

import styles from './OrderBook.module.less'

type GetTableColumns = (props: {
  onSelectAll: () => void
  findOfferInSelection: (offerPubkey: string) => OfferOptimistic | null
  toggleOfferInSelection: (offer: BorrowOffer) => void
  hasSelectedOffers: boolean
}) => ColumnType<BorrowOffer>[]

export const getTableColumns: GetTableColumns = ({
  onSelectAll,
  findOfferInSelection,
  toggleOfferInSelection,
  hasSelectedOffers,
}) => {
  const columns: ColumnType<BorrowOffer>[] = [
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
      render: (offer) => {
        return (
          <div className={styles.checkboxRow}>
            <Checkbox
              className={styles.checkbox}
              onChange={() => toggleOfferInSelection(offer)}
              checked={!!findOfferInSelection(offer.publicKey)}
            />
            <div className={styles.borrowValueContainer}>
              <DisplayValue value={parseFloat(offer.maxTokenToGet)} />
              <span className={styles.ltvValue}>
                {createPercentValueJSX(parseFloat(offer.ltv) / 100)} LTV
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'apr',
      title: (
        <div className={styles.aprRow}>
          <HeaderCell label="APR" />
        </div>
      ),
      render: (offer) => (
        <div className={styles.aprRowValue}>
          {createPercentValueJSX(parseFloat(offer.apr) / 100)}
        </div>
      ),
    },
    {
      key: 'offerSize',
      title: <HeaderCell label="Offer size" />,
      render: (offer) => <DisplayValue value={parseFloat(offer.maxTokenToGet)} />,
    },
  ]

  return columns
}
