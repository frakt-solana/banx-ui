import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'

import { BorrowOfferOptimistic } from '../hooks/useSelectedOffers'
import { AprCell } from './cells'

import styles from './OrderBook.module.less'

type GetTableColumns = (props: {
  onSelectAll: () => void
  findOfferInSelection: (offerPubkey: string) => BorrowOfferOptimistic | null
  toggleOfferInSelection: (offer: BorrowOffer) => void
  hasSelectedOffers: boolean
  restCollateralsAmount: number
  tokenType: LendingTokenType
  collateral: CollateralToken | undefined
}) => ColumnType<BorrowOffer>[]

export const getTableColumns: GetTableColumns = ({
  onSelectAll,
  findOfferInSelection,
  toggleOfferInSelection,
  hasSelectedOffers,
  restCollateralsAmount,
  collateral,
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
        const ltvPercent = parseFloat(offer.ltv) / 100

        const collateralTokenDecimals = Math.pow(10, collateral?.collateral.decimals || 0)
        const selectedOffer = findOfferInSelection(offer.publicKey)

        const tokenToGet = Math.min(
          (restCollateralsAmount * collateralTokenDecimals) / parseFloat(offer.collateralsPerToken),
          parseFloat(offer.maxTokenToGet),
        )

        const selectedOfferBorrowValue = selectedOffer
          ? parseFloat(selectedOffer.offer.maxTokenToGet)
          : 0

        const displayBorrowValue = selectedOfferBorrowValue || tokenToGet

        return (
          <div className={styles.checkboxRow}>
            <Checkbox
              className={styles.checkbox}
              onChange={() => toggleOfferInSelection(offer)}
              checked={!!selectedOffer}
            />
            <div className={styles.borrowValueContainer}>
              <DisplayValue value={displayBorrowValue} />
              <span className={styles.ltvValue}>{createPercentValueJSX(ltvPercent)} LTV</span>
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
      render: (offer) => <AprCell offer={offer} />,
    },
    {
      key: 'offerSize',
      title: <HeaderCell label="Offer size" />,
      render: (offer) => <DisplayValue value={parseFloat(offer.maxTokenToGet)} />,
    },
  ]

  return columns
}
