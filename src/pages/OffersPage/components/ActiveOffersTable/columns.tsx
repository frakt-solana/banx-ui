import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createPercentValueJSX,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import { ActionsCell, LentCell, StatusCell } from './TableCells'

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
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (_, loan) => <LentCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="CRT. Interest" tooltipText="CRT. Interest" />,
      render: (_, loan) => createSolValueJSX(loan.bondTradeTransaction.solAmount, 1e9),
      sorter: true,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" tooltipText="APR" />,
      render: (_, loan) => createPercentValueJSX(loan.bondTradeTransaction.amountOfBonds / 1e2),
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" tooltipText="Loan status" />,
      render: (_, loan) => <StatusCell loan={loan} />,
      sorter: true,
    },
    {
      title: <HeaderCell label="Termination" />,
      render: () => <ActionsCell />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
