import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
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
        <NftInfoCell
          onChangeCheckbox={() => null}
          nftName={loan.nft.name}
          nftImage={loan.nft.imageUrl}
        />
      ),
    },
    {
      key: 'loanValue',
      dataIndex: 'loanValue',
      title: () => <HeaderCell label="Borrowed" value="loanValue" />,
      render: (value: number) => createSolValueJSX(value, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    {
      key: 'repayValue',
      dataIndex: 'repayValue',
      title: () => <HeaderCell label="Debt" value="repayValue" />,
      render: (value: number) => createSolValueJSX(value, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    {
      key: 'duration',
      dataIndex: 'duration',
      title: () => <HeaderCell label="Duration" value="duration" />,
      render: (_, loan) => createTimeValueJSX(loan.bondParams.expiredAt),
      showSorterTooltip: false,
      sorter: true,
    },
  ]

  return COLUMNS
}
