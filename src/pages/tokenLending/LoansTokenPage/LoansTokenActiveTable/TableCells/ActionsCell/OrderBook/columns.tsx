import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell } from '@banx/components/TableComponents'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { calculateIdleFundsInOffer } from '@banx/utils'

import { AprCell, BorrowCell } from './cells'

import styles from './OrderBook.module.less'

type GetTableColumns = (props: {
  onRowClick: (offer: BondOfferV3) => void
  findOfferInSelection: (offerPubkey: string) => BondOfferV3 | null
  loan: core.TokenLoan
  tokenType: LendingTokenType
}) => ColumnType<BondOfferV3>[]

export const getTableColumns: GetTableColumns = ({
  findOfferInSelection,
  onRowClick,
  loan,
  tokenType,
}) => {
  const columns: ColumnType<BondOfferV3>[] = [
    {
      key: 'borrow',
      title: (
        <div className={styles.checkboxRow}>
          <HeaderCell label="To borrow" />
        </div>
      ),
      render: (offer) => (
        <BorrowCell
          loan={loan}
          offer={offer}
          onClick={() => onRowClick(offer)}
          isSelected={!!findOfferInSelection(offer.publicKey.toBase58())}
          tokenType={tokenType}
        />
      ),
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
      render: (offer) => {
        const offerSize = calculateIdleFundsInOffer(convertBondOfferV3ToCore(offer))
        return <DisplayValue value={offerSize.toNumber()} />
      },
    },
  ]

  return columns
}
