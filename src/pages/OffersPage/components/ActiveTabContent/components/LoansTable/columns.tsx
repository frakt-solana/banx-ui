import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
  createPercentValueJSX,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateClaimValue, isLoanAbleToTerminate } from '@banx/pages/OffersPage'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import { ActionsCell, ClaimCell, StatusCell } from './TableCells'
import { LoanOptimistic } from './loansState'

import styles from './LoansTable.module.less'

interface GetTableColumnsProps {
  findLoanInSelection: (loanPubkey: string) => LoanOptimistic | null
  toggleLoanInSelection: (loan: Loan) => void
  onSelectAll: () => void

  hasSelectedLoans: boolean
  isCardView: boolean
}

export const getTableColumns = ({
  findLoanInSelection,
  toggleLoanInSelection,
  onSelectAll,
  hasSelectedLoans,
  isCardView,
}: GetTableColumnsProps) => {
  const columns: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" align="left" />
        </div>
      ),
      render: (loan) => {
        const { partnerPoints = 0, playerPoints = 0, name, imageUrl } = loan.nft.meta

        const canSelect = isLoanAbleToTerminate(loan)
        const selected = canSelect ? !!findLoanInSelection(loan.publicKey) : undefined

        return (
          <NftInfoCell
            key={loan.publicKey}
            nftName={name}
            nftImage={imageUrl}
            selected={selected}
            onCheckboxClick={() => toggleLoanInSelection(loan)}
            banxPoints={{ partnerPoints, playerPoints }}
            checkboxClassName={!canSelect ? styles.nftCellCheckbox : ''}
          />
        )
      },
    },
    {
      key: 'interest',
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
      title: <HeaderCell label="Ltv" />,
      render: (loan) => {
        const ltv = (calculateClaimValue(loan) / loan.nft.collectionFloor) * 100
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
          value={createSolValueJSX(
            loan.bondTradeTransaction.lenderFullRepaidAmount,
            1e9,
            '0◎',
            formatDecimal,
          )}
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
