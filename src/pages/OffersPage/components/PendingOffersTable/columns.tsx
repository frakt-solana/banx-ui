import { ColumnsType } from 'antd/es/table'
import { isInteger } from 'lodash'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { APRCell, ActionsCell, InterestCell } from './TableCells'
import { TableUserOfferData } from './helpers'

export const getTableColumns = ({ isCardView }: { isCardView: boolean }) => {
  const columns: ColumnsType<TableUserOfferData> = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collection" />,
      render: (_, { collectionImage, collectionName }) => (
        <NftInfoCell nftName={collectionName} nftImage={collectionImage} />
      ),
    },
    {
      key: 'offer',
      title: <HeaderCell label="Offer" />,
      render: (_, { loanValue }) => createSolValueJSX(loanValue, 1e9),
      sorter: true,
    },
    {
      key: 'loans',
      title: <HeaderCell label="Loans" />,
      render: (_, { loansAmount }) => (
        <span>{isInteger(loansAmount) ? loansAmount : loansAmount?.toFixed(2)}</span>
      ),
      sorter: true,
    },
    {
      key: 'size',
      title: <HeaderCell label="Size" />,
      render: (_, { size }) => createSolValueJSX(size, 1e9),
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="Est. Daily interest" />,
      render: (_, offer) => <InterestCell offer={offer} />,
      sorter: true,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (_, offer) => <APRCell offer={offer} />,
      sorter: true,
    },
    {
      title: <HeaderCell label="" />,
      render: (_, offer) => <ActionsCell isCardView={isCardView} offer={offer} />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
