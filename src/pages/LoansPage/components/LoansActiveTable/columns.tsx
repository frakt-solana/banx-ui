import { ColumnsType } from 'antd/es/table'

import Checkbox from '@banx/components/Checkbox'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableCells'
import Timer from '@banx/components/Timer'

import { Loan } from '@banx/api/loans'

import styles from './LoansTable.module.less'

export const getTableColumns = ({
  onSelectAll,
  findLoanInSelection,
  toggleLoanInSelection,
  hasSelectedLoans,
}: {
  onSelectAll: () => void
  findLoanInSelection: (loanPubkey: string) => Loan | null
  toggleLoanInSelection: (loan: Loan) => void
  hasSelectedLoans: boolean
}) => {
  const COLUMNS: ColumnsType<Loan> = [
    {
      key: 'collateral',
      dataIndex: 'collateral',
      title: () => (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" value="collateral" />
        </div>
      ),
      render: (_, loan) => (
        <NftInfoCell
          selected={!!findLoanInSelection(loan.pubkey)}
          onCheckboxClick={() => toggleLoanInSelection(loan)}
          nftName={loan.nft.name}
          nftImage={loan.nft.imageUrl}
        />
      ),
    },
    {
      key: 'loanValue',
      dataIndex: 'loanValue',
      title: () => <HeaderCell label="Borrowed" value="loanValue" />,
      render: (value: number) => createSolValueJSX(value, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    {
      key: 'repayValue',
      dataIndex: 'repayValue',
      title: () => <HeaderCell label="Debt" value="repayValue" />,
      render: (value: number) => createSolValueJSX(value, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    {
      key: 'duration',
      dataIndex: 'duration',
      title: () => <HeaderCell label="Duration" value="duration" />,
      render: (_, loan) => <Timer expiredAt={loan.bondParams.expiredAt} />,
      showSorterTooltip: false,
      sorter: true,
    },
  ]

  return COLUMNS
}
