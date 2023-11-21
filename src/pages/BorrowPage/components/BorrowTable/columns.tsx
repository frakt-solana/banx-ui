import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'

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
  hasSelectedNfts: boolean
  onSelectAll: () => void
}

export const getTableColumns = ({
  findOfferInCart,
  onNftSelect,
  onBorrow,
  isCardView,
  hasSelectedNfts,
  onSelectAll,
}: GetTableColumnsProps) => {
  const columns: ColumnType<TableNftData>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedNfts} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (nft) => (
        <NftInfoCell
          selected={nft.selected}
          onCheckboxClick={() => onNftSelect(nft)}
          nftName={nft.nft.nft.meta.name}
          nftImage={nft.nft.nft.meta.imageUrl}
          banxPoints={{
            partnerPoints: nft.nft.nft.meta.partnerPoints || 0,
            playerPoints: nft.nft.nft.meta.playerPoints || 0,
          }}
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
