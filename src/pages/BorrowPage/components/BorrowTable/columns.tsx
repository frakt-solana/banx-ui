import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { calcLoanValueWithProtocolFee } from '@banx/utils'

import { SimpleOffer } from '../../types'
import { BorrowCell } from './BorrowCell'
import { TableNftData } from './types'

interface GetTableColumnsProps {
  onNftSelect: (nft: TableNftData) => void
  onBorrow: (nft: TableNftData) => void
  findOfferInCart: (nft: TableNftData) => SimpleOffer | null
  isCardView: boolean
}

export const getTableColumns = ({
  findOfferInCart,
  onNftSelect,
  onBorrow,
  isCardView,
}: GetTableColumnsProps) => {
  const columns: ColumnsType<TableNftData> = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" />,
      render: (_, nft) => (
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
      render: (_, nft) => createSolValueJSX(nft.nft.nft.collectionFloor, 1e9),
    },
    {
      key: 'loanValue',
      title: <HeaderCell label="Borrow" />,
      render: (_, nft) => createSolValueJSX(calcLoanValueWithProtocolFee(nft.loanValue), 1e9),
    },
    {
      key: 'weeklyFee',
      title: <HeaderCell label="Weekly Fee" />,
      render: (_, nft) => createSolValueJSX(nft.interest, 1e9),
    },
    {
      title: <HeaderCell label="" />,
      render: (_, nft) => (
        <BorrowCell
          isCardView={isCardView}
          disabled={!!findOfferInCart(nft)}
          onBorrow={() => onBorrow(nft)}
        />
      ),
    },
  ]

  return columns.map((column) => createColumn(column))
}
