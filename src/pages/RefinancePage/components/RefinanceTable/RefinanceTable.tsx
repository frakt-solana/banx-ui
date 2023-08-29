import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store'

import { getTableColumns } from './columns'
import { useRefinanceTable } from './hooks'

export const RefinanceTable = () => {
  const { loans, sortViewParams, loading } = useRefinanceTable()

  const { viewState } = useTableView()

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
  })

  return (
    <Table
      data={loans}
      columns={columns}
      sortViewParams={sortViewParams}
      rowKeyField="publicKey"
      loading={loading}
      showCard
    />
  )
}
