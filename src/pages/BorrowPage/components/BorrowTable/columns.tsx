import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'

import { calcBorrowValueWithProtocolFee, formatDecimal } from '@banx/utils'

import { SimpleOffer } from '../../types'
import { BorrowActionCell } from './BorrowActionCell'
import { APRCell, BorrowCell } from './cells'
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
      key: 'loanValue',
      title: <HeaderCell label="Borrow" />,
      render: (nft) => <BorrowCell nft={nft} />,
    },
    {
      key: 'fee',
      title: <HeaderCell label="Upfront fee" />,
      render: ({ loanValue }) => {
        const protocolFee = loanValue - calcBorrowValueWithProtocolFee(loanValue)
        return createSolValueJSX(protocolFee, 1e9, '--', formatDecimal)
      },
    },
    {
      key: 'apr',
      title: <HeaderCell label="Apr" />,
      render: (nft) => <APRCell nft={nft} />,
    },
    {
      key: 'borrowCell',
      title: <HeaderCell label="" />,
      render: (nft) => (
        <BorrowActionCell
          isCardView={isCardView}
          disabled={!!findOfferInCart(nft) || !nft.loanValue}
          onBorrow={async () => await onBorrow(nft)}
        />
      ),
    },
  ]

  return columns
}
