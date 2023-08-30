import Table from '@banx/components/Table'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useHistoryLoansTable } from './hooks'

import styles from './LoansHistoryTable.module.less'

export const LoansHistoryTable = () => {
  const { offers, loading, sortViewParams } = useHistoryLoansTable()

  const columns = getTableColumns()

  return (
    <div className={styles.tableRoot}>
      <div className={styles.tableWrapper}>
        <Table
          data={offers}
          columns={columns}
          rowKeyField="publicKey"
          sortViewParams={sortViewParams}
          loading={loading}
          showCard
        />
      </div>
      <Summary />
    </div>
  )
}
