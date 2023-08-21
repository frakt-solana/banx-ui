import { ColumnsType } from 'antd/es/table'

import Checkbox from '@banx/components/Checkbox'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableCells'

import { Loan } from '@banx/api/core'

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
  const COLUMNS: ColumnsType<Loan> = [
    {
      key: 'collateral',
      dataIndex: 'collateral',
      title: () => (
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
      dataIndex: 'loanValue',
      title: () => <HeaderCell label="Borrowed" />,
      render: (_, loan) => createSolValueJSX(loan.fraktBond.borrowedAmount, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    {
      key: 'repayValue',
      dataIndex: 'repayValue',
      title: () => <HeaderCell label="Debt" />,
      render: (_, loan) => <RepayValueCell loan={loan} />,
      showSorterTooltip: false,
      sorter: true,
    },
    {
      key: 'health',
      dataIndex: 'health',
      title: () => <HeaderCell label="Est. health" />,
      render: (_, loan) => createSolValueJSX(loan.fraktBond.amountToReturn, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: () => <HeaderCell label="Loan status" />,
      render: (_, loan) => <StatusCell loan={loan} />,
      showSorterTooltip: false,
      sorter: true,
    },
    {
      title: () => <HeaderCell label="Repay" />,
      render: (_, loan) => <RepayCell loan={loan} />,
    },
  ]

  return COLUMNS
}
