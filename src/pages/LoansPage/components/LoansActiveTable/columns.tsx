import Checkbox from '@banx/components/Checkbox'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'
import { ColumnType, createColumn } from '@banx/components/TableVirtual'

import { Loan } from '@banx/api/core'
import { formatDecimal } from '@banx/utils'

import { LoanOptimistic } from '../../loansState'
import { ActionsCell, DebtCell, HealthCell, StatusCell } from './TableCells'

import styles from './LoansActiveTable.module.less'

interface GetTableColumnsProps {
  onSelectAll: () => void
  findLoanInSelection: (loanPubkey: string) => LoanOptimistic | null
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
}: GetTableColumnsProps): ColumnType<Loan>[] => {
  const columns: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (loan) => (
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
      render: ({ fraktBond }) =>
        createSolValueJSX(fraktBond.borrowedAmount, 1e9, '--', formatDecimal),
      sorter: true,
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (loan) => <DebtCell loan={loan} isCardView={isCardView} />,
      sorter: true,
    },
    {
      key: 'health',
      title: (
        <HeaderCell
          label="Est. Health"
          tooltipText="Estimated  health of loans using a formula: 1 - (debt / floor)"
        />
      ),
      render: (loan) => <HealthCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'status',
      title: (
        <HeaderCell
          label="Loan status"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (loan) => <StatusCell loan={loan} isCardView={isCardView} />,
      sorter: true,
    },
    {
      title: <HeaderCell label="" />,
      render: (loan) => (
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
