import Table from '@banx/components/Table'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useHistoryLoansTable } from './hooks'

import styles from './LoansHistoryTable.module.less'

export const LoansHistoryTable = () => {
  const { loans, loading, sortViewParams } = useHistoryLoansTable()

  const columns = getTableColumns()

  return (
    <div className={styles.tableRoot}>
      <div className={styles.tableWrapper}>
        <Table
          data={loans}
          columns={columns}
          rowKeyField="publicKey"
          sortViewParams={sortViewParams}
          loading={loading}
          showCard
        />
      </div>
      <Summary loans={loans} />
    </div>
  )
}
