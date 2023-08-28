import { ColumnType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import { RefinanceCell } from './TableCells/RefinanceCell'

interface GetTableColumnsProps {
  isCardView: boolean
}

export const getTableColumns = ({ isCardView }: GetTableColumnsProps) => {
  const columns: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" />,
      render: (_, loan) => (
        <NftInfoCell nftName={loan.nft.meta.name} nftImage={loan.nft.meta.imageUrl} />
      ),
    },
    {
      key: 'floorPrice',
      title: <HeaderCell label="Floor price" />,
      render: (_, loan) => createSolValueJSX(loan.nft.collectionFloor, 1e9),
      sorter: true,
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (_, loan) => createSolValueJSX(loan.nft.collectionFloor, 1e9),
      sorter: true,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (_, { fraktBond }) => createSolValueJSX(fraktBond.amountToReturn, 1e9),
      sorter: true,
    },
    {
      key: 'aprIncrease',
      title: <HeaderCell label="APR increase" />,
      render: (_, { fraktBond }) => createSolValueJSX(fraktBond.amountToReturn, 1e9),
      sorter: true,
    },
    {
      key: 'nextAprIncrease',
      title: <HeaderCell label="Next APR increase" />,
      render: (_, { fraktBond }) => createSolValueJSX(fraktBond.amountToReturn, 1e9),
      sorter: true,
    },
    {
      key: 'duration',
      title: <HeaderCell label="Ends in" />,
      render: (_, { fraktBond }) => createSolValueJSX(fraktBond.amountToReturn, 1e9),
    },
    {
      title: <HeaderCell label="" />,
      render: (_, loan) => <RefinanceCell loan={loan} isCardView={isCardView} />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
