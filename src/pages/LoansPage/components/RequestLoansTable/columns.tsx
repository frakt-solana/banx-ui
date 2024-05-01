import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import { APRCell, ActionsCell, FreezeCell, LTVCell } from './TableCells'
import { LoanOptimistic } from './loansState'

import styles from './RequestLoansTable.module.less'

type GetTableColumns = (props: {
  onSelectAll: () => void
  findLoanInSelection: (loanPubkey: string) => LoanOptimistic | null
  toggleLoanInSelection: (loan: Loan) => void
  hasSelectedLoans: boolean
  isCardView: boolean
}) => ColumnType<Loan>[]

export const getTableColumns: GetTableColumns = ({
  onSelectAll,
  findLoanInSelection,
  toggleLoanInSelection,
  hasSelectedLoans,
  isCardView,
}) => {
  const columns: ColumnType<Loan>[] = [
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
      title: <HeaderCell label="Freeze" tooltipText="Freeze" />,
      render: (loan) => <FreezeCell loan={loan} />,
    },
    {
      key: 'actionsCell',
      title: <HeaderCell label="" />,
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
