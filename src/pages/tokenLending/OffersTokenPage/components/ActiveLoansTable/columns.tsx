import { FC, ReactNode } from 'react'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  CollateralTokenCell,
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/tokens'
import { Coin, Snowflake } from '@banx/icons'
import {
  calculateTokenRepaymentCallLenderReceivesAmount,
  getHumanReadableTokenSupply,
  isTokenLoanFrozen,
  isTokenLoanLiquidated,
  isTokenLoanListed,
  isTokenLoanRepaymentCallActive,
  isTokenLoanTerminating,
} from '@banx/utils'

import { calculateFreezeExpiredAt } from './ManageModal/helpers'
import { ActionsCell, ClaimCell, LTVCell, StatusCell } from './TableCells'
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
      render: (loan) => {
        const canSelect =
          !isTokenLoanLiquidated(loan) && !isTokenLoanTerminating(loan) && !isTokenLoanListed(loan)

        const selected = canSelect ? !!findLoanInSelection(loan.publicKey) : undefined

        return (
          <CollateralTokenCell
            key={loan.publicKey}
            selected={selected}
            onCheckboxClick={() => toggleLoanInSelection(loan)}
            collateralTokenAmount={Math.trunc(getHumanReadableTokenSupply(loan))}
            checkboxClassName={!canSelect ? styles.collateralCellCheckbox : ''}
            collateralImageUrl={loan.collateral.logoUrl}
            rightContentJSX={createRightContentJSX(loan)}
          />
        )
      },
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
      render: (loan) => <LTVCell loan={loan} />,
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

const createRightContentJSX = (loan: core.TokenLoan) => {
  const repaymentCallLenderReceives = calculateTokenRepaymentCallLenderReceivesAmount(loan)
  const freezeExpiredAt = calculateFreezeExpiredAt(loan)

  const repaymentCallContent = createTooltipContent({
    icon: <Coin />,
    content: (
      <p className={styles.repaymentCallTooltipValue}>
        <DisplayValue value={repaymentCallLenderReceives} /> requested
      </p>
    ),
  })

  const freezeLoanContent = createTooltipContent({
    icon: <Snowflake className={styles.snowflakeIcon} />,
    content: (
      <p>
        <Timer expiredAt={freezeExpiredAt} /> until the end of non termination period
      </p>
    ),
  })

  if (isTokenLoanRepaymentCallActive(loan) && isTokenLoanFrozen(loan)) {
    return (
      <div className={styles.iconsTooltipWrapper}>
        {repaymentCallContent}
        {freezeLoanContent}
      </div>
    )
  }

  if (isTokenLoanRepaymentCallActive(loan)) return repaymentCallContent
  if (isTokenLoanFrozen(loan)) return freezeLoanContent

  return ''
}

interface CreateTooltipContentProps {
  content: ReactNode
  icon: ReactNode
}

const createTooltipContent: FC<CreateTooltipContentProps> = ({ content, icon }) => (
  <Tooltip className={styles.iconTooltipContent} title={content}>
    {icon}
  </Tooltip>
)
