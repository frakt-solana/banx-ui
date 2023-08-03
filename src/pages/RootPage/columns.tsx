import { ColumnsType } from 'antd/es/table'

import {
  CollaterallCell,
  HeaderCell,
  createSolValueJSX,
  createTimeValueJSX,
} from '@banx/components/TableCells'

export const getTableList = () => {
  const COLUMNS: ColumnsType | any = [
    {
      key: 'collectionName',
      dataIndex: 'collectionName',
      title: () => <HeaderCell label="Collection Name" value="collectionName" />,
      render: (_: any, market: any) => (
        <CollaterallCell collateralName={market.nftName} collateralImage={market.nftImage} />
      ),
    },
    {
      key: 'loanValue',
      dataIndex: 'loanValue',
      title: (column: any) => (
        <HeaderCell columns={column?.sortColumns} label="Active loans" value="loanValue" />
      ),
      render: (value: number) => createSolValueJSX(value, 1e9),
      showSorterTooltip: false,
    },
    {
      key: 'repayValue',
      dataIndex: 'repayValue',
      title: (column: any) => (
        <HeaderCell
          columns={column?.sortColumns}
          label="Best offer"
          value="repayValue"
          tooltipText="Total liquidity currently available in active offers"
        />
      ),
      render: (value: number) => createSolValueJSX(value, 1e9),
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: (column: any) => (
        <HeaderCell columns={column?.sortColumns} label="APY" value="status" />
      ),
      render: (value: any) => <span>{value}</span>,
    },
    {
      key: 'when',
      dataIndex: 'when',
      title: (column: any) => (
        <HeaderCell columns={column?.sortColumns} label="Offer TVL" value="when" />
      ),
      render: (value: any) => <span>{createTimeValueJSX(value)}</span>,
    },
    {
      key: 'loanType',
      dataIndex: 'loanType',
      title: (column: any) => (
        <HeaderCell columns={column?.sortColumns} label="Duration" value="loanType" />
      ),
      render: (value: any) => <span>{value}</span>,
    },
  ]

  return COLUMNS
}
