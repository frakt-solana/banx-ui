import { ColumnType } from 'antd/es/table'

import Checkbox from '@banx/components/Checkbox'
import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import { ActionsCell, DebtCell, HealthCell, StatusCell } from './TableCells'

import styles from './LoansActiveTable.module.less'

interface GetTableColumnsProps {
  onSelectAll: () => void
  findLoanInSelection: (loanPubkey: string) => Loan | null
  toggleLoanInSelection: (loan: Loan) => void
  hasSelectedLoans: boolean
  isCardView: boolean
}

export const getTableColumns = ({
  onSelectAll,
  findLoanInSelection,
  toggleLoanInSelection,
  hasSelectedLoans,
  isCardView,
}: GetTableColumnsProps) => {
  const columns: ColumnType<Loan>[] = [
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
      render: (_, { fraktBond }) => createSolValueJSX(fraktBond.borrowedAmount, 1e9),
      sorter: true,
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (_, loan) => <DebtCell loan={loan} isCardView={isCardView} />,
      sorter: true,
    },
    {
      key: 'health',
      title: <HeaderCell label="Est. Health" tooltipText="Health = 1 - (debt / floor)" />,
      render: (_, loan) => <HealthCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" />,
      render: (_, loan) => <StatusCell loan={loan} isCardView={isCardView} />,
      sorter: true,
    },
    {
      title: <HeaderCell label="" />,
      render: (_, loan) => (
        <ActionsCell
          loan={loan}
          isCardView={isCardView}
          disableActions={!!findLoanInSelection(loan.publicKey)}
        />
      ),
    },
  ]

  return columns.map((column) => createColumn(column))
}
