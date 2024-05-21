import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'

import { APRCell, ActionsCell, DebtCell, LTVCell, StatusCell } from './TableCells'
import { LoanOptimistic } from './loansState'

import styles from './LoansActiveTable.module.less'

interface GetTableColumnsProps {
  onSelectAll: () => void
  findLoanInSelection: (loanPubkey: string) => LoanOptimistic | null
  toggleLoanInSelection: (loan: core.Loan) => void
  hasSelectedLoans: boolean
  isCardView: boolean
  offers: Record<string, core.Offer[]>
}

export const getTableColumns = ({
  onSelectAll,
  findLoanInSelection,
  toggleLoanInSelection,
  hasSelectedLoans,
  isCardView,
  offers,
}: GetTableColumnsProps): ColumnType<core.Loan>[] => {
  const columns: ColumnType<core.Loan>[] = [
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
          key={loan.publicKey}
          selected={!!findLoanInSelection(loan.publicKey)}
          onCheckboxClick={() => toggleLoanInSelection(loan)}
          nftName={loan.nft.meta.name}
          nftImage={loan.nft.meta.imageUrl}
          banxPoints={{
            partnerPoints: loan.nft.meta.partnerPoints || 0,
            playerPoints: loan.nft.meta.playerPoints || 0,
          }}
        />
      ),
    },
    {
      key: 'debt',
      title: (
        <HeaderCell
          label="Debt"
          tooltipText="Hover over the debt balance of your loans below to view a breakdown of your principal, interest and repayments (if any) to date"
        />
      ),
      render: (loan) => <DebtCell loan={loan} />,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="LTV" />,
      render: (loan) => <LTVCell loan={loan} />,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => <APRCell loan={loan} />,
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
      title: <HeaderCell label="" />,
      render: (loan) => (
        <ActionsCell
          loan={loan}
          offers={offers}
          isCardView={isCardView}
          disableActions={!!findLoanInSelection(loan.publicKey)}
        />
      ),
    },
  ]

  return columns
}
