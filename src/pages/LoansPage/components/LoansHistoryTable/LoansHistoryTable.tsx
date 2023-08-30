import Table from '@banx/components/Table'

import { getTableColumns } from './columns'
import { useHistoryLoansTable } from './hooks'

export const LoansHistoryTable = () => {
  const { offers, loading, sortViewParams } = useHistoryLoansTable()

  const columns = getTableColumns()

  return (
    <Table
      data={offers}
      columns={columns}
      rowKeyField="publicKey"
      sortViewParams={sortViewParams}
      loading={loading}
      showCard
    />
  )
}
