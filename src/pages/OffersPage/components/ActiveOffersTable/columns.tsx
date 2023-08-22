import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import { ActionsCell } from './TableCells'

export const getTableColumns = () => {
  const columns: ColumnsType<Loan> = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" />,
      render: (_, loan) => (
        <NftInfoCell nftName={loan.nft.meta.name} nftImage={loan.nft.meta.imageUrl} />
      ),
    },
    {
      key: 'offer',
      title: <HeaderCell label="Lend" />,
      render: (_, loan) => createSolValueJSX(loan.bondTradeTransaction.solAmount, 1e9),
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="crt. interest" />,
      render: (_, loan) => createSolValueJSX(loan.bondTradeTransaction.solAmount, 1e9),

      sorter: true,
    },
    {
      key: 'apr',
      title: <HeaderCell label="apr" />,
      render: (_, loan) => createSolValueJSX(loan.bondTradeTransaction.solAmount, 1e9),
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" />,
      render: (_, loan) => createSolValueJSX(loan.bondTradeTransaction.solAmount, 1e9),
      sorter: true,
    },
    {
      title: <HeaderCell label="Termination" />,
      render: () => <ActionsCell />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
