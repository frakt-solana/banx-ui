import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useHistoryLoansTable } from './hooks'

import styles from './LoansHistoryTable.module.less'

export const LoansHistoryTable = () => {
  const { loans, loading, sortViewParams, showEmptyList, emptyListParams, showSummary, loadMore } =
    useHistoryLoansTable()

  const { viewState } = useTableView()

  const columns = getTableColumns({ isCardView: viewState === ViewState.CARD })

  if (showEmptyList) return <EmptyList {...emptyListParams} />

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
