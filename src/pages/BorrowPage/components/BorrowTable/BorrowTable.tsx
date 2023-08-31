import Table from '@banx/components/Table'

import { Summary } from './Summary'
import { useBorrowTable } from './hooks'

import styles from './BorrowTable.module.less'

const BorrowTable = () => {
  const { tableNftData, columns, onRowClick, sortViewParams, isLoading } = useBorrowTable()

  return (
    <div className={styles.tableRoot}>
      <Summary />
      <div className={styles.tableWrapper}>
        <Table
          data={tableNftData}
          columns={columns}
          onRowClick={onRowClick}
          sortViewParams={sortViewParams}
          className={styles.borrowTable}
          rowKeyField="mint"
          loading={isLoading}
          showCard
        />
      </div>
    </div>
  )
}

export default BorrowTable
