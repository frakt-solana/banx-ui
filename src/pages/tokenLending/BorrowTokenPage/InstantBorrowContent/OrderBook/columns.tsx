import { BN } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'

import { AprCell, BorrowCell } from './cells'

import styles from './OrderBook.module.less'

type GetTableColumns = (props: {
  onSelectAll: () => void
  findOfferInSelection: (offerId: string) => BorrowOffer | null
  toggleOfferInSelection: (offer: BorrowOffer) => void
  hasSelectedOffers: boolean
  restCollateralsAmount: BN
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
  tokenType,
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
        const selectedOffer = findOfferInSelection(offer.id)

        return (
          <div className={styles.checkboxRow}>
            <Checkbox
              className={styles.checkbox}
              onChange={() => toggleOfferInSelection(offer)}
              checked={!!selectedOffer}
            />
            <BorrowCell
              offer={offer}
              selectedOffer={selectedOffer}
              restCollateralsAmount={restCollateralsAmount}
              tokenType={tokenType}
            />
          </div>
        )
      },
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (offer) => (
        <AprCell offer={offer} marketPubkey={collateral?.marketPubkey ?? PUBKEY_PLACEHOLDER} />
      ),
    },
    {
      key: 'maxLtv',
      title: <HeaderCell label="Max ltv" />,
      render: (offer) => (
        <span className={styles.ltvValue}>
          {createPercentValueJSX(parseFloat(offer.maxLtv) / 100)}
        </span>
      ),
    },
    {
      key: 'offerSize',
      title: <HeaderCell label="Offer size" />,
      render: (offer) => (
        <span className={styles.offerSizeValue}>
          <DisplayValue value={parseFloat(offer.maxTokenToGet)} />
        </span>
      ),
    },
  ]

  return columns
}
