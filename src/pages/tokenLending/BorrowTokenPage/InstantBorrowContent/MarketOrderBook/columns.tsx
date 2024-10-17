import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell } from '@banx/components/TableComponents'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { ZERO_BN } from '@banx/utils'

import { AprCell, BorrowCell } from '../OrderBook/cells'

import styles from './MarketOrderBook.module.less'

type GetTableColumns = (props: {
  collateral: CollateralToken
  tokenType: LendingTokenType
}) => ColumnType<BorrowOffer>[]

export const getTableColumns: GetTableColumns = ({ collateral, tokenType }) => {
  const columns: ColumnType<BorrowOffer>[] = [
    {
      key: 'borrow',
      title: (
        <div className={styles.checkboxRow}>
          <Checkbox className={styles.checkbox} onChange={() => null} checked={false} />
          <HeaderCell label="To borrow" />
        </div>
      ),
      render: (offer) => {
        return (
          <div className={styles.checkboxRow}>
            <Checkbox className={styles.checkbox} onChange={() => null} checked={false} />
            <BorrowCell
              offer={offer}
              selectedOffer={null}
              restCollateralsAmount={ZERO_BN}
              tokenType={tokenType}
            />
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
      render: (offer) => <AprCell offer={offer} marketPubkey={collateral?.marketPubkey} />,
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
