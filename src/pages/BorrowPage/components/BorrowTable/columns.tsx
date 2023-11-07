import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'
import { ColumnType } from '@banx/components/TableVirtual'

import { calcLoanValueWithProtocolFee, formatDecimal } from '@banx/utils'

import { SimpleOffer } from '../../types'
import { BorrowCell } from './BorrowCell'
import { TableNftData } from './types'

import styles from './BorrowTable.module.less'

interface GetTableColumnsProps {
  onNftSelect: (nft: TableNftData) => void
  onBorrow: (nft: TableNftData) => Promise<void>
  findOfferInCart: (nft: TableNftData) => SimpleOffer | null
  isCardView: boolean
}

export const getTableColumns = ({
  findOfferInCart,
  onNftSelect,
  onBorrow,
  isCardView,
}: GetTableColumnsProps) => {
  const columns: ColumnType<TableNftData>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (nft) => (
        <NftInfoCell
          selected={nft.selected}
          onCheckboxClick={() => onNftSelect(nft)}
          nftName={nft.nft.nft.meta.name}
          nftImage={nft.nft.nft.meta.imageUrl}
        />
      ),
    },
    {
      key: 'floorPrice',
      title: <HeaderCell label="Floor" />,
      render: (nft) => createSolValueJSX(nft.nft.nft.collectionFloor, 1e9, '--', formatDecimal),
    },
    {
      key: 'loanValue',
      title: <HeaderCell label="Borrow" />,
      render: (nft) =>
        createSolValueJSX(calcLoanValueWithProtocolFee(nft.loanValue), 1e9, '--', formatDecimal),
    },
    {
      key: 'weeklyFee',
      title: <HeaderCell label="Weekly Fee" />,
      render: (nft) => createSolValueJSX(nft.interest, 1e9, '--', formatDecimal),
    },
    {
      key: 'borrowCell',
      title: <HeaderCell label="" />,
      render: (nft) => (
        <BorrowCell
          isCardView={isCardView}
          disabled={!!findOfferInCart(nft) || !nft.loanValue}
          onBorrow={async () => await onBorrow(nft)}
        />
      ),
    },
  ]

  return columns
}
