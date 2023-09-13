import { useWallet } from '@solana/wallet-adapter-react'

import Table from '@banx/components/Table'

import { useFakeInfinityScroll } from '@banx/hooks'

import { getTableColumns } from './columns'
import { EMPTY_MESSAGE } from './constants'
import { useNotConnectedBorrow } from './hooks'

const NotConnectedTable = () => {
  const { connected } = useWallet()
  const { marketsPreview, sortViewParams, isLoading } = useNotConnectedBorrow()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: marketsPreview })

  const columns = getTableColumns()

  return (
    <>
      <Table
        data={data}
        columns={columns}
        sortViewParams={sortViewParams}
        rowKeyField="marketPubkey"
        loading={isLoading}
        emptyMessage={connected ? EMPTY_MESSAGE : ''}
        showCard
      />
      <div ref={fetchMoreTrigger} />
    </>
  )
}

export default NotConnectedTable
