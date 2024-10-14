import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  CollateralTokenCell,
  DisplayValue,
  HeaderCell,
  HorizontalCell,
} from '@banx/components/TableComponents'

import { TokenLoan } from '@banx/api/tokens'
import { formatCollateralTokenValue, getTokenLoanSupply } from '@banx/utils'

import { TokenLoanOptimistic } from './loansState'
import { APRCell, ActionsCell, FreezeCell, LTVCell } from './tableCells'

import styles from './TokenLoanListingsTable.module.less'

type GetTableColumns = (props: {
  onSelectAll: () => void
  findLoanInSelection: (loanPubkey: string) => TokenLoanOptimistic | null
  toggleLoanInSelection: (loan: TokenLoan) => void
  hasSelectedLoans: boolean
  isCardView: boolean
}) => ColumnType<TokenLoan>[]

export const getTableColumns: GetTableColumns = ({
  onSelectAll,
  findLoanInSelection,
  toggleLoanInSelection,
  hasSelectedLoans,
  isCardView,
}) => {
  const columns: ColumnType<TokenLoan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (loan) => (
        <CollateralTokenCell
          key={loan.publicKey}
          selected={!!findLoanInSelection(loan.publicKey)}
          onCheckboxClick={() => toggleLoanInSelection(loan)}
          collateralImageUrl={loan.collateral.logoUrl}
          collateralTokenTicker={loan.collateral.ticker}
          collateralTokenAmount={formatCollateralTokenValue(getTokenLoanSupply(loan))}
        />
      ),
    },
    {
      key: 'loanValue',
      title: <HeaderCell label="Borrow" />,
      render: (loan) => (
        <HorizontalCell value={<DisplayValue value={loan.bondTradeTransaction.solAmount} />} />
      ),
    },
    {
      key: 'ltv',
      title: <HeaderCell label="Ltv" />,
      render: (loan) => <LTVCell loan={loan} />,
    },
    {
      key: 'apr',
      title: <HeaderCell label="Apr" />,
      render: (loan) => <APRCell loan={loan} />,
    },
    {
      key: 'freeze',
      title: (
        <HeaderCell label="Freeze" tooltipText="Period during which loan can't be terminated" />
      ),
      render: (loan) => <FreezeCell loan={loan} />,
    },
    {
      key: 'actionsCell',
      render: (loan) => (
        <ActionsCell
          loan={loan}
          isCardView={isCardView}
          disabled={!!findLoanInSelection(loan.publicKey)}
        />
      ),
    },
  ]

  return columns
}
