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
    },
    {
      key: 'loans',
      title: <HeaderCell label="Loans" />,
      render: (_, { loansAmount }) => (
        <span>{isInteger(loansAmount) ? loansAmount : loansAmount?.toFixed(2)}</span>
      ),
    },
    {
      key: 'size',
      title: <HeaderCell label="Size" />,
      render: (_, { size }) => createSolValueJSX(size, 1e9),
    },
    {
      key: 'interest',
      title: <HeaderCell label="Est. Weekly interest" />,
      render: (_, offer) => <InterestCell offer={offer} />,
    },
    {
      key: 'apy',
      title: <HeaderCell label="APY" />,
      render: (_, offer) => <APRCell offer={offer} />,
    },
    {
      title: <HeaderCell label="" />,
      render: (_, offer) => <ActionsCell isCardView={isCardView} offer={offer} />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
