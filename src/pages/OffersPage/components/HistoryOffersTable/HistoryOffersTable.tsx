import Table from '@banx/components/Table'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useHistoryOffersTable } from './hooks'

import styles from './HistoryOffersTable.module.less'

export const HistoryOffersTable = () => {
  const { loans, sortViewParams, loading, fetchMoreTrigger } = useHistoryOffersTable()

  const columns = getTableColumns()

  return (
    <div className={styles.tableRoot}>
      <div className={styles.tableWrapper}>
        <Table
          data={loans}
          columns={columns}
          sortViewParams={sortViewParams}
          className={styles.rootTable}
          rowKeyField="publicKey"
          loading={loading}
          showCard
        />
        <div ref={fetchMoreTrigger} />
      </div>
      <Summary loans={loans} />
    </div>
  )
}
