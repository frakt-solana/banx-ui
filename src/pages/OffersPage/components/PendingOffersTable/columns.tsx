import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { ActionsCell } from './TableCells'

export const getTableColumns = () => {
  const columns: ColumnsType<any> = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collection" />,
      render: (_, offer) => <NftInfoCell nftName={offer.name} nftImage="" />,
    },
    {
      key: 'offer',
      title: <HeaderCell label="Offer" />,
      render: (_, offer) => createSolValueJSX(offer.offer, 1e9),
      sorter: true,
    },
    {
      key: 'loans',
      title: <HeaderCell label="Loans" />,
      render: (_, offer) => <>{offer.loans}</>,
      sorter: true,
    },
    {
      key: 'size',
      title: <HeaderCell label="Size" />,
      render: (_, offer) => createSolValueJSX(offer.offer, 1e9),
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="Est. Daily interest" />,
      render: (_, offer) => createSolValueJSX(offer.offer, 1e9),
      sorter: true,
    },
    {
      render: (_, offer) => <ActionsCell offer={offer} />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
