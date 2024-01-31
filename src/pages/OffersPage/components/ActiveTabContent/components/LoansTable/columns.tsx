import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  HeaderCell,
  NftInfoCell,
  RowCell,
  createPercentValueJSX,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLentValue } from '@banx/pages/OffersPage'
import { formatDecimal, isLoanTerminating } from '@banx/utils'

import { ActionsCell, InterestCell, StatusCell } from './TableCells'

import styles from './LoansTable.module.less'

interface GetTableColumnsProps {
  findLoanInSelection: (loanPubkey: string) => Loan | null
  toggleLoanInSelection: (loan: Loan) => void
  onSelectAll: () => void

  isUnderwaterFilterActive: boolean
  hasSelectedLoans: boolean
  isCardView: boolean
}

export const getTableColumns = ({
  findLoanInSelection,
  toggleLoanInSelection,
  onSelectAll,
  isUnderwaterFilterActive,
  hasSelectedLoans,
  isCardView,
}: GetTableColumnsProps) => {
  const columns: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          {isUnderwaterFilterActive && (
            <Checkbox
              className={styles.checkbox}
              onChange={onSelectAll}
              checked={hasSelectedLoans}
            />
          )}
          <HeaderCell label="Collateral" align="left" />
        </div>
      ),
      render: (loan) => {
        const { partnerPoints = 0, playerPoints = 0, name, imageUrl } = loan.nft.meta

        const canSelect = isUnderwaterFilterActive && !isLoanTerminating(loan)

        const onCheckboxClick = isUnderwaterFilterActive
          ? () => toggleLoanInSelection(loan)
          : undefined

        const selected = canSelect ? !!findLoanInSelection(loan.publicKey) : undefined

        return (
          <NftInfoCell
            nftName={name}
            nftImage={imageUrl}
            selected={selected}
            onCheckboxClick={onCheckboxClick}
            banxPoints={{ partnerPoints, playerPoints }}
            checkboxClassName={!canSelect ? styles.nftCellCheckbox : ''}
          />
        )
      },
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (loan) => (
        <RowCell value={createSolValueJSX(calculateLentValue(loan), 1e9, '0◎', formatDecimal)} />
      ),
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
        <RowCell value={createSolValueJSX(loan.totalRepaidAmount, 1e9, '0◎', formatDecimal)} />
      ),
    },
    {
      key: 'interest',
      title: (
        <HeaderCell
          label="Claim"
          tooltipText="Sum of lent amount and accrued interest to date, less any repayments"
        />
      ),
      render: (loan) => <InterestCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => (
        <RowCell
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
      render: (loan) => <StatusCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'actionsCell',
      title: !isCardView ? <HeaderCell label="" /> : undefined,
      render: (loan) => <ActionsCell loan={loan} isCardView={isCardView} />,
    },
  ]

  return columns
}
