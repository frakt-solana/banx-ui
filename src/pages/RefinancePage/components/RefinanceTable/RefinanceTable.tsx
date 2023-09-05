import { useFakeInfinityScroll } from '@banx/components/InfinityScroll'
import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store'

import { getTableColumns } from './columns'
import { useRefinanceTable } from './hooks'

export const RefinanceTable = () => {
  const { loans, sortViewParams, loading } = useRefinanceTable()

  const { viewState } = useTableView()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
  })

  return (
    <>
      <Table
        data={data}
        columns={columns}
        sortViewParams={sortViewParams}
        rowKeyField="publicKey"
        loading={loading}
        showCard
      />
      <div ref={fetchMoreTrigger} />
    </>
  )
}
