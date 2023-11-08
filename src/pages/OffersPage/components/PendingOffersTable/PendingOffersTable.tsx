import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store'

import { getTableColumns } from './columns'
import { usePendingOfferTable } from './hooks'

import styles from './PendingOffersTable.module.less'

export const PendingOfferTable = () => {
  const { offers, loading, sortViewParams, emptyListParams, showEmptyList } = usePendingOfferTable()

  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const columns = getTableColumns({ isCardView })

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <Table
      data={offers}
      columns={columns}
      className={styles.table}
      sortViewParams={sortViewParams}
      loading={loading}
      showCard
    />
  )
}
