import { ColumnsType } from 'antd/es/table'

import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'

import { BorrowCell } from './BorrowCell'
import { FeeCell } from './FeeCell'
import { TableNftData } from './types'

interface GetTableColumnsProps {
  onNftSelect: (nft: TableNftData) => void
  onBorrow: (nft: TableNftData) => void
  isCartEmpty: boolean
  isCardView: boolean
}

export const getTableColumns = ({
  onNftSelect,
  onBorrow,
  isCartEmpty,
  isCardView,
}: GetTableColumnsProps) => {
  const COLUMNS: ColumnsType<TableNftData> = [
    {
      key: 'collateral',
      dataIndex: 'collateral',
      title: () => <HeaderCell label="Collateral" />,
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
      dataIndex: 'floorPrice',
      title: () => <HeaderCell label="Floor" />,
      render: (_, nft) => createSolValueJSX(nft.nft.nft.collectionFloor, 1e9),
      sorter: true,
    },
    {
      key: 'loanValue',
      dataIndex: 'loanValue',
      title: () => <HeaderCell label="Borrow" />,
      render: (_, nft) => createSolValueJSX(nft.loanValue, 1e9),
      sorter: true,
    },
    {
      key: 'weeklyFee',
      dataIndex: 'weeklyFee',
      title: () => <HeaderCell label="Weekly Fee" />,
      render: (_, nft) => <FeeCell nft={nft} />,
      sorter: true,
    },
    {
      title: <HeaderCell label="" />,
      render: (_, nft) => (
        <BorrowCell
          isCardView={isCardView}
          disabled={!isCartEmpty}
          onBorrow={() => onBorrow(nft)}
        />
      ),
    },
  ]

  return COLUMNS
}
