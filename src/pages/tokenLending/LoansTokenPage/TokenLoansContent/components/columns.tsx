import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { HeaderCell } from '@banx/components/TableComponents'

import { TokenLoan } from '@banx/api/tokens'
import { formatCollateralTokenValue, getTokenLoanSupply } from '@banx/utils'

import { TokenLoanOptimistic } from '../loansCart'
import { APRCell, ActionsCell, DebtCell, LTVCell, StatusCell } from './tableCells'

import styles from '../TokenLoansContent.module.less'

interface GetTableColumnsProps {
  findLoanInSelection: (loanPubkey: string) => TokenLoanOptimistic | null
  onRowClick: (loan: TokenLoan) => void
  onSelectAll: () => void
  hasSelectedLoans: boolean
  tokenType: LendingTokenType
}

export const getTableColumns = ({
  findLoanInSelection,
  onRowClick,
  onSelectAll,
  hasSelectedLoans,
  tokenType,
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
      key: 'debt',
      title: <HeaderCell label="Debt" className={styles.headerCellText} />,
      render: (loan) => <DebtCell loan={loan} />,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="LTV" className={styles.headerCellText} />,
      render: (loan) => <LTVCell loan={loan} tokenType={tokenType} />,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" className={styles.headerCellText} />,
      render: (loan) => <APRCell loan={loan} />,
    },
    {
      key: 'status',
      title: <HeaderCell label="Status" className={styles.headerCellText} />,
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
