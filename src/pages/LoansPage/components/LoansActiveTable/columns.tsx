import { ColumnsType } from 'antd/es/table'

import {
  CollaterallCell,
  HeaderCell,
  createSolValueJSX,
  createTimeValueJSX,
} from '@banx/components/TableCells'

export const getTableColumns = () => {
  const COLUMNS: ColumnsType = [
    {
      key: 'collateral',
      dataIndex: 'collateral',
      title: () => <HeaderCell label="Collateral" value="collateral" />,
      render: (_, market: any) => (
        <CollaterallCell collateralName={market.nftName} collateralImage={market.nftImage} />
      ),
    },
    {
      key: 'loanValue',
      dataIndex: 'loanValue',
      title: (column) => (
        <HeaderCell columns={column?.sortColumns} label="Borrowed" value="loanValue" />
      ),
      render: (value: number) => createSolValueJSX(value, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    {
      key: 'repayValue',
      dataIndex: 'repayValue',
      title: (column) => (
        <HeaderCell columns={column?.sortColumns} label="Debt" value="repayValue" />
      ),
      render: (value: number) => createSolValueJSX(value, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    {
      key: 'duration',
      dataIndex: 'duration',
      title: (column) => (
        <HeaderCell columns={column?.sortColumns} label="Duration" value="duration" />
      ),
      render: (value) => createTimeValueJSX(value),
      sorter: true,
      showSorterTooltip: false,
    },
  ]

  return COLUMNS
}
