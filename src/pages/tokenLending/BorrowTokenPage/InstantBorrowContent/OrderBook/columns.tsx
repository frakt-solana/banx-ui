import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { Offer } from '@banx/api/nft'
import { CollateralToken } from '@banx/api/tokens'
import { calculateIdleFundsInOffer } from '@banx/utils'

import { OfferOptimistic } from '../hooks/useSelectedOffers'

import styles from './OrderBook.module.less'

type GetTableColumns = (props: {
  onSelectAll: () => void
  findOfferInSelection: (offerPubkey: string) => OfferOptimistic | null
  toggleOfferInSelection: (offer: Offer) => void
  hasSelectedOffers: boolean

  collateral: CollateralToken | undefined
}) => ColumnType<Offer>[]

export const getTableColumns: GetTableColumns = ({
  onSelectAll,
  findOfferInSelection,
  toggleOfferInSelection,
  hasSelectedOffers,
  collateral,
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
      render: (offer) => {
        const ltvPercent = collateral?.collateral.decimals

        return (
          <div className={styles.checkboxRow}>
            <Checkbox
              className={styles.checkbox}
              onChange={() => toggleOfferInSelection(offer)}
              checked={!!findOfferInSelection(offer.publicKey)}
            />
            <div className={styles.borrowValueContainer}>
              <DisplayValue value={calculateIdleFundsInOffer(offer).toNumber()} />
              <span className={styles.ltvValue}>{createPercentValueJSX(ltvPercent)} LTV</span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (offer) => createPercentValueJSX(offer.loanApr / 100),
    },
    {
      key: 'offerSize',
      title: <HeaderCell label="Offer size" />,
      render: (offer) => <DisplayValue value={calculateIdleFundsInOffer(offer).toNumber()} />,
    },
  ]

  return columns
}
