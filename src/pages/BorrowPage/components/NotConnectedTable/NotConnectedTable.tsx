import { useWallet } from '@solana/wallet-adapter-react'

import Table from '@banx/components/TableVirtual'

import { getTableColumns } from './columns'
import { EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from './constants'
import { useNotConnectedBorrow } from './hooks'

const NotConnectedTable = () => {
  const { connected } = useWallet()
  const { marketsPreview, sortViewParams, isLoading } = useNotConnectedBorrow()

  const columns = getTableColumns()

  const emptyMessage = connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE

  return (
    <Table
      data={marketsPreview}
      columns={columns}
      sortViewParams={sortViewParams}
      loading={isLoading}
      emptyMessage={emptyMessage}
      showCard
    />
  )
}

export default NotConnectedTable
