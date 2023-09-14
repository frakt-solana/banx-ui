import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { useFakeInfinityScroll } from '@banx/hooks'
import { ViewState, useTableView } from '@banx/store'

import { getTableColumns } from './columns'
import { useActiveOffersTable } from './hooks'

import styles from './ActiveOffersTable.module.less'

const ActiveOffersTable = () => {
  const { loans, sortViewParams, loading, showEmptyList, emptyListParams } = useActiveOffersTable()

  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const columns = getTableColumns({ isCardView })

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <>
      <Table
        data={data}
        columns={columns}
        sortViewParams={sortViewParams}
        className={styles.rootTable}
        rowKeyField="publicKey"
        loading={loading}
        showCard
      />
      <div ref={fetchMoreTrigger} />
    </>
  )
}

export default ActiveOffersTable
