import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { HeaderCell } from '@banx/components/TableComponents'

import { TokenLoan } from '@banx/api/tokens'
import { formatCollateralTokenValue, getTokenLoanSupply } from '@banx/utils'

import { TableColumnKey } from '../constants'
import { SortColumnOption } from '../hooks/useSortedLoans'
import { TokenLoanOptimistic } from '../loansCart'
import { APRCell, ActionsCell, DebtCell, LTVCell, StatusCell } from './tableCells'

import styles from '../TokenLoansContent.module.less'

interface GetTableColumnsProps {
  findLoanInSelection: (loanPubkey: string) => TokenLoanOptimistic | null
  onRowClick: (loan: TokenLoan) => void
  onSelectAll: () => void
  hasSelectedLoans: boolean
  tokenType: LendingTokenType
  onSort: (value: SortColumnOption<TableColumnKey>) => void
  selectedSortOption: SortColumnOption<TableColumnKey>
}

export const getTableColumns = ({
  findLoanInSelection,
  onRowClick,
  onSelectAll,
  hasSelectedLoans,
  tokenType,
  onSort,
  selectedSortOption,
}: GetTableColumnsProps) => {
  const columns: ColumnType<TokenLoan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.checkboxCell}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" className={styles.headerCellText} />
        </div>
      ),
      render: (loan) => {
        return (
          <div className={styles.checkboxCell}>
            <Checkbox
              className={styles.checkbox}
              onChange={() => onRowClick(loan)}
              checked={!!findLoanInSelection(loan.publicKey)}
            />

            <span className={styles.collateralTokenAmount}>
              {formatCollateralTokenValue(getTokenLoanSupply(loan))}
            </span>
          </div>
        )
      },
    },
    {
      key: TableColumnKey.DEBT,
      title: (
        <HeaderCell
          label="Debt"
          className={styles.headerCellText}
          columnKey={TableColumnKey.DEBT}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan) => <DebtCell loan={loan} />,
    },
    {
      key: TableColumnKey.LTV,
      title: (
        <HeaderCell
          label="LTV"
          className={styles.headerCellText}
          columnKey={TableColumnKey.LTV}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan) => <LTVCell loan={loan} tokenType={tokenType} />,
    },
    {
      key: TableColumnKey.APR,
      title: (
        <HeaderCell
          label="APR"
          className={styles.headerCellText}
          columnKey={TableColumnKey.APR}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan) => <APRCell loan={loan} />,
    },
    {
      key: TableColumnKey.STATUS,
      title: (
        <HeaderCell
          label="Status"
          className={styles.headerCellText}
          columnKey={TableColumnKey.STATUS}
          onSort={onSort}
          selectedSortOption={selectedSortOption}
        />
      ),
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'actionsCell',
      render: (loan) => (
        <ActionsCell loan={loan} disableActions={!!findLoanInSelection(loan.publicKey)} />
      ),
    },
  ]

  return columns
}
