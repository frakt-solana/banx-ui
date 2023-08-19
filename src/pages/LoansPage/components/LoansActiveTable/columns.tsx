import { ColumnType } from 'antd/es/table'

import Checkbox from '@banx/components/Checkbox'
import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/loans'

import { RepayCell, StatusCell } from './TableCells'
import { RepayValueCell } from './TableCells/RepayValueCell'

import styles from './LoansTable.module.less'

export const getTableColumns = ({
  onSelectAll,
  findLoanInSelection,
  toggleLoanInSelection,
  hasSelectedLoans,
}: {
  onSelectAll: () => void
  findLoanInSelection: (loanPubkey: string) => Loan | null
  toggleLoanInSelection: (loan: Loan) => void
  hasSelectedLoans: boolean
}) => {
  const columnConfigs: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (_, loan) => (
        <NftInfoCell
          selected={!!findLoanInSelection(loan.publicKey)}
          onCheckboxClick={() => toggleLoanInSelection(loan)}
          nftName={loan.nft.meta.name}
          nftImage={loan.nft.meta.imageUrl}
        />
      ),
    },
    {
      key: 'loanValue',
      title: <HeaderCell label="Borrowed" />,
      render: (_, loan) => createSolValueJSX(loan.fraktBond.borrowedAmount, 1e9),
      sorter: true,
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (_, loan) => <RepayValueCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'health',
      title: <HeaderCell label="Est. health" />,
      render: (_, loan) => createSolValueJSX(loan.fraktBond.amountToReturn, 1e9),
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" />,
      render: (_, loan) => <StatusCell loan={loan} />,
      sorter: true,
    },
    {
      title: <HeaderCell label="Repay" />,
      render: (_, loan) => <RepayCell loan={loan} />,
    },
  ]

  return columnConfigs.map((config) => createColumn(config))
}
