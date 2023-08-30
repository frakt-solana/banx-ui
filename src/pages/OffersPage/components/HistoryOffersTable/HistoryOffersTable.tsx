import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store'

import { getTableColumns } from './columns'
import { useHistoryOffersTable } from './hooks'

import styles from './HistoryOffersTable.module.less'

export const HistoryOffersTable = () => {
  const { loans, sortViewParams, loading } = useHistoryOffersTable()

  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const columns = getTableColumns({ isCardView })

  return (
    <Table
      data={loans}
      columns={columns}
      sortViewParams={sortViewParams}
      className={styles.rootTable}
      rowKeyField="publicKey"
      loading={loading}
      showCard
    />
  )
}
