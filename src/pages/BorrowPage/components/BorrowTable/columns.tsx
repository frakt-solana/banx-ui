import { ColumnsType } from 'antd/es/table'

import Checkbox from '@banx/components/Checkbox'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableCells'

import { BorrowCell } from './BorrowCell'
import { TableNftData } from './BorrowTable'

// import { RepayCell, StatusCell } from './TableCells'
// import { RepayValueCell } from './TableCells/RepayValueCell'
import styles from './BorrowTable.module.less'

interface GetTableColumnsProps {
  onSelectAll: () => void
  onNftSelect: (nft: TableNftData) => void
  isCartEmpty: boolean
}

export const getTableColumns = ({
  onSelectAll,
  onNftSelect,
  isCartEmpty,
}: GetTableColumnsProps) => {
  const COLUMNS: ColumnsType<TableNftData> = [
    {
      key: 'collateral',
      dataIndex: 'collateral',
      title: () => (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={!isCartEmpty} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (_, nft) => (
        <NftInfoCell
          selected={nft.selected}
          onCheckboxClick={() => onNftSelect(nft)}
          nftName={nft.nft.nft.meta.name}
          nftImage={nft.nft.nft.meta.imageUrl}
        />
      ),
    },
    {
      key: 'loanValue',
      dataIndex: 'loanValue',
      title: () => <HeaderCell label="Borrow" />,
      render: (_, nft) => createSolValueJSX(nft.loanValue, 1e9),
      showSorterTooltip: false,
      sorter: true,
    },
    // {
    //   key: 'repayValue',
    //   dataIndex: 'repayValue',
    //   title: () => <HeaderCell label="Debt" />,
    //   render: (_, loan) => <RepayValueCell loan={loan} />,
    //   showSorterTooltip: false,
    //   sorter: true,
    // },
    // {
    //   key: 'health',
    //   dataIndex: 'health',
    //   title: () => <HeaderCell label="Est. health" />,
    //   render: (_, loan) => createSolValueJSX(loan.fraktBond.amountToReturn, 1e9),
    //   showSorterTooltip: false,
    //   sorter: true,
    // },
    // {
    //   key: 'status',
    //   dataIndex: 'status',
    //   title: () => <HeaderCell label="Loan status" />,
    //   render: (_, loan) => <StatusCell loan={loan} />,
    //   showSorterTooltip: false,
    //   sorter: true,
    // },
    {
      title: () => <HeaderCell label="" />,
      render: (_, nft) => <BorrowCell nft={nft} disabled={!isCartEmpty} />,
    },
  ]

  return COLUMNS
}
