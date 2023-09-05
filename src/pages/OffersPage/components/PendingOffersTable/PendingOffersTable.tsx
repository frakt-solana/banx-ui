import { useFakeInfinityScroll } from '@banx/components/InfinityScroll'
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

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: parsedUserOffers })

  return (
    <>
      <Table
        data={data}
        columns={columns}
        rowKeyField="publicKey"
        sortViewParams={sortViewParams}
        loading={loading}
        showCard
      />
      <div ref={fetchMoreTrigger} />
    </>
  )
}
