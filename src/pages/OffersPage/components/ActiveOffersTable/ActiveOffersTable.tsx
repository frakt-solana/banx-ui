import { useFakeInfinityScroll } from '@banx/components/InfinityScroll'
import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store'

import { getTableColumns } from './columns'
import { useActiveOffersTable } from './hooks'

import styles from './ActiveOffersTable.module.less'

const ActiveOffersTable = () => {
  const { loans, sortViewParams, loading } = useActiveOffersTable()

  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const columns = getTableColumns({ isCardView })

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

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
