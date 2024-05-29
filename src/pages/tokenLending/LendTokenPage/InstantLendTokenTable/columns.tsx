import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { HeaderCell } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'

import { ActionsCell } from './TableCells'

import styles from './InstantLendTokenTable.module.less'

interface GetTableColumnsProps {
  toggleLoanInSelection: (loan: core.TokenLoan) => void
  findLoanInSelection: (loanPubkey: string) => core.TokenLoan | null
  onSelectAll: () => void
  isCardView: boolean
  hasSelectedLoans: boolean
}

export const getTableColumns = ({
  isCardView,
  findLoanInSelection,
  onSelectAll,
  hasSelectedLoans,
}: GetTableColumnsProps) => {
  const columns: ColumnType<core.TokenLoan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: () => <></>,
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: () => <></>,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="LTV" />,
      render: () => <></>,
    },
    {
      key: 'freeze',
      title: <HeaderCell label="Freeze" />,
      render: () => <></>,
    },
    {
      key: 'duration',
      title: <HeaderCell label="Ends in" />,
      render: () => <></>,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: () => <></>,
    },
    {
      key: 'refinanceCell',
      title: <HeaderCell label="" />,
      render: (loan) => (
        <ActionsCell
          loan={loan}
          isCardView={isCardView}
          disabledAction={!!findLoanInSelection(loan.publicKey)}
        />
      ),
    },
  ]

  return columns
}
