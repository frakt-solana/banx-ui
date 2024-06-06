import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  CollateralTokenCell,
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import {
  HealthColorIncreasing,
  calculateLentTokenValueWithInterest,
  getColorByPercent,
} from '@banx/utils'

import { ActionsCell, ClaimCell, StatusCell } from './TableCells'
import { TokenLoanOptimistic } from './loansState'

import styles from './ActiveLoansTable.module.less'

interface GetTableColumnsProps {
  toggleLoanInSelection: (loan: core.TokenLoan) => void
  findLoanInSelection: (loanPubkey: string) => TokenLoanOptimistic | null
  onSelectAll: () => void
  isCardView: boolean
  hasSelectedLoans: boolean
}

export const getTableColumns = ({
  isCardView,
  findLoanInSelection,
  onSelectAll,
  hasSelectedLoans,
  toggleLoanInSelection,
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
      render: (loan) => (
        <CollateralTokenCell
          key={loan.publicKey}
          selected={!!findLoanInSelection(loan.publicKey)}
          onCheckboxClick={() => toggleLoanInSelection(loan)}
          collateralTokenAmount={loan.collateral.priceUSDC}
          collateralImageUrl={loan.collateral.imageUrl}
        />
      ),
    },
    {
      key: 'claim',
      title: (
        <HeaderCell
          label="Claim"
          tooltipText="Sum of lent amount and accrued interest to date, less any repayments"
        />
      ),
      render: (loan) => <ClaimCell loan={loan} />,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="LTV" />,
      render: (loan) => {
        const lentTokenValueWithInterest = calculateLentTokenValueWithInterest(loan).toNumber()
        const ltv = (lentTokenValueWithInterest / loan.collateralPrice) * 100

        return (
          <HorizontalCell
            textColor={getColorByPercent(ltv, HealthColorIncreasing)}
            value={createPercentValueJSX(ltv, '0%')}
          />
        )
      },
    },
    {
      key: 'repaid',
      title: (
        <HeaderCell
          label="Repaid"
          tooltipText="Repayments returned to pending offer if open, or wallet if closed"
        />
      ),
      render: (loan) => (
        <HorizontalCell
          value={<DisplayValue value={loan.bondTradeTransaction.lenderFullRepaidAmount} />}
        />
      ),
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => (
        <HorizontalCell
          value={createPercentValueJSX(loan.bondTradeTransaction.amountOfBonds / 100)}
          isHighlighted
        />
      ),
    },
    {
      key: 'status',
      title: (
        <HeaderCell
          label="Status"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'actionsCell',
      title: <HeaderCell label="" />,
      render: (loan) => <ActionsCell loan={loan} isCardView={isCardView} />,
    },
  ]

  return columns
}
