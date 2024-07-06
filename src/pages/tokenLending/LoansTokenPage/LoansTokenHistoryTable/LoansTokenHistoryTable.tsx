import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store/common'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useTokenHistoryLoansTable } from './hooks'

import styles from './LoansTokenHistoryTable.module.less'

const LoansTokenHistoryTable = () => {
  const { loans, loading, sortViewParams, showEmptyList, emptyListParams, showSummary, loadMore } =
    useTokenHistoryLoansTable()

  const { viewState } = useTableView()

  const columns = getTableColumns({ isCardView: viewState === ViewState.CARD })

  if (showEmptyList) return <EmptyList className={styles.emptyList} {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        sortViewParams={sortViewParams}
        loadMore={loadMore}
        className={styles.table}
        loading={loading}
        showCard
      />
      {showSummary && <Summary />}
    </div>
  )
}

export default LoansTokenHistoryTable
