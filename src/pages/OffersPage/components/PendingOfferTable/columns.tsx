import { ColumnsType } from 'antd/es/table'

import { HeaderCell, NftInfoCell } from '@banx/components/TableCells'

export const getTableColumns = () => {
  const COLUMNS: ColumnsType<any> = [
    {
      key: 'collateral',
      dataIndex: 'collateral',
      title: () => <HeaderCell label="Collection" />,
      render: () => <NftInfoCell nftName="" nftImage="" />,
    },
    {
      key: 'loanValue',
      dataIndex: 'loanValue',
      title: () => <HeaderCell label="Borrow" />,
      // render: (_, nft) => createSolValueJSX(nft.loanValue, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    {
      title: () => <HeaderCell label="" />,
    },
  ]

  return COLUMNS
}
