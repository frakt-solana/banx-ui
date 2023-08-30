import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

export const getTableColumns = () => {
  const columns: ColumnsType<any> = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collection" />,
      render: (_, { collectionImage, collectionName }) => (
        <NftInfoCell nftName={collectionName} nftImage={collectionImage} />
      ),
    },
    {
      key: 'borrowed',
      title: <HeaderCell label="Borrowed" />,
      render: (_, { loanValue }) => createSolValueJSX(loanValue, 1e9),
      sorter: true,
    },
    {
      key: 'debt',
      title: <HeaderCell label="Debt" />,
      render: (_, { loanValue }) => createSolValueJSX(loanValue, 1e9),
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" />,
      render: (_, { loanValue }) => createSolValueJSX(loanValue, 1e9),
      sorter: true,
    },
    {
      key: 'repaidBy',
      title: <HeaderCell label="Repaid by" />,
      render: (_, { loanValue }) => createSolValueJSX(loanValue, 1e9),
      sorter: true,
    },
  ]

  return columns.map((column) => createColumn(column))
}
