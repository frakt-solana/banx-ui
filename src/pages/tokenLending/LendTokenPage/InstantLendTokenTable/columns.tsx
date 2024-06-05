import { SECONDS_IN_DAY } from 'fbonds-core/lib/fbond-protocol/constants'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { CollateralTokenCell, HeaderCell, HorizontalCell } from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/tokens'
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import { Hourglass, Snowflake } from '@banx/icons'
import { isTokenLoanFrozen, isTokenLoanListed } from '@banx/utils'

import { APRCell, ActionsCell, DebtCell, LTVCell } from './TableCells'

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
          rightContentJSX={createRightContentJSX(loan)}
        />
      ),
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (loan) => <DebtCell loan={loan} />,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="LTV" />,
      render: (loan) => <LTVCell loan={loan} />,
    },
    {
      key: 'freeze',
      title: <HeaderCell label="Freeze" />,
      render: (loan) => {
        const terminationFreezeInDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY
        const freezeValue = isTokenLoanFrozen(loan) ? `${terminationFreezeInDays} days` : '--'
        return <HorizontalCell value={freezeValue} />
      },
    },
    {
      key: 'duration',
      title: <HeaderCell label="Ends in" />,
      render: (loan) => {
        const expiredAt = loan.fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
        return !isTokenLoanListed(loan) ? <Timer expiredAt={expiredAt} /> : '--'
      },
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => <APRCell loan={loan} />,
    },
    {
      key: 'actionsCell',
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

const createRightContentJSX = (loan: core.TokenLoan) => {
  if (isTokenLoanListed(loan) && !isTokenLoanFrozen(loan)) {
    return null
  }

  const tooltipText = isTokenLoanFrozen(loan)
    ? `This loan has a freeze period during which it can't be terminated`
    : 'This loan is available for a limited amount of time'

  return (
    <Tooltip title={tooltipText}>
      {isTokenLoanFrozen(loan) ? (
        <Snowflake className={styles.snowflakeIcon} />
      ) : (
        <Hourglass className={styles.hourglassIcon} />
      )}
    </Tooltip>
  )
}
