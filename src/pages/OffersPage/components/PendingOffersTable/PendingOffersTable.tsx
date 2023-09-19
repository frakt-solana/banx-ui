import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { useFakeInfinityScroll } from '@banx/hooks'
import { ViewState, useTableView } from '@banx/store'

import { getTableColumns } from './columns'
import { usePendingOfferTable } from './hooks'

import styles from './PendingOffersTable.module.less'

export const PendingOfferTable = () => {
  const { offers, loading, sortViewParams, emptyListParams, showEmptyList } = usePendingOfferTable()

  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const columns = getTableColumns({ isCardView })

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: offers })

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <>
      <Table
        data={data}
        columns={columns}
        rowKeyField="publicKey"
        className={styles.table}
        sortViewParams={sortViewParams}
        loading={loading}
        showCard
      />
      <div ref={fetchMoreTrigger} />
    </>
  )
}
