import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store'

import { getTableColumns } from './columns'
import { parseUserOffers } from './helpers'
import { usePendingOfferTable } from './hooks'

export const PendingOfferTable = () => {
  const { offers, loading, sortViewParams } = usePendingOfferTable()

  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const columns = getTableColumns({ isCardView })
  const parsedUserOffers = parseUserOffers(offers)

  return (
    <Table
      data={parsedUserOffers}
      columns={columns}
      rowKeyField="publicKey"
      sortViewParams={sortViewParams}
      loading={loading}
      showCard
    />
  )
}
