import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { useFakeInfinityScroll } from '@banx/hooks'
import { PATHS } from '@banx/router'
import { ViewState, useTableView } from '@banx/store'

import { getTableColumns } from './columns'
import { EMPTY_MESSAGE } from './constants'
import { useRefinanceTable } from './hooks'

export const RefinanceTable = () => {
  const { loans, sortViewParams, loading, showEmptyList } = useRefinanceTable()

  const { viewState } = useTableView()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
  })

  if (showEmptyList)
    return <EmptyList message={EMPTY_MESSAGE} buttonText="Lend SOL" path={PATHS.LEND} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={data}
        columns={columns}
        sortViewParams={sortViewParams}
        rowKeyField="publicKey"
        loading={loading}
        showCard
      />
      <div ref={fetchMoreTrigger} />
    </div>
}
