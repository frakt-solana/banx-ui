import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createPercentValueJSX,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { ActionsCell } from './TableCells'

export const getTableColumns = () => {
  const columns: ColumnsType<any> = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" />,
      render: (_, offer) => <NftInfoCell nftName={offer.name} nftImage="" />,
    },
    {
      key: 'offer',
      title: <HeaderCell label="Lend" />,
      render: (_, offer) => createSolValueJSX(offer.offer, 1e9),
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="crt. interest" />,
      render: (_, offer) => <>{offer.loans}</>,
      sorter: true,
    },
    {
      key: 'apr',
      title: <HeaderCell label="apr" />,
      render: (_, offer) => createPercentValueJSX(offer.offer / 1e9),
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" />,
      render: (_, offer) => createSolValueJSX(offer.offer, 1e9),
      sorter: true,
    },
    {
      title: <HeaderCell label="Termination" />,
      render: () => <ActionsCell />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
