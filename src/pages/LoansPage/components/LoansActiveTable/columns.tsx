import { ColumnsType } from 'antd/es/table'

import {
  CollaterallCell,
  HeaderCell,
  createSolValueJSX,
  createTimeValueJSX,
} from '@banx/components/TableCells'

import { Loan } from '@banx/api/loans'

export const getTableColumns = () => {
  const COLUMNS: ColumnsType<Loan> = [
    {
      key: 'collateral',
      dataIndex: 'collateral',
      title: () => <HeaderCell label="Collateral" value="collateral" />,
      render: (_, loan) => (
        <CollaterallCell collateralName={loan.nft.name} collateralImage={loan.nft.imageUrl} />
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
      render: (_, loan) => createTimeValueJSX((loan.bondParams as any).expiredAt),
      showSorterTooltip: false,
      sorter: true,
    },
  ]

  return COLUMNS
}
