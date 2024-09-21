import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLenderTokenActivityTable } from './hooks'

import styles from './LenderTokenActivityTable.module.less'

const LenderTokenActivityTable = () => {
  const { loans, sortViewParams, loading, showEmptyList, emptyListParams, showSummary, loadMore } =
    useLenderTokenActivityTable()

  const columns = getTableColumns()

  if (showEmptyList) return <EmptyList className={styles.emptyList} {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        sortViewParams={sortViewParams}
        className={styles.table}
        loadMore={loadMore}
        loading={loading}
        showCard
      />
      {showSummary && <Summary />}
    </div>
  )
}

export default LenderTokenActivityTable
