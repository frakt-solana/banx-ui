import Table from '@banx/components/Table'

import { getTableList } from './columns'
import { mockData } from './constants'

const RootPage = () => {
  const columns = getTableList()

  const table = {
    data: mockData,
    columns,
    onRowClick: null,
    rowKeyField: 'id',
  }

  return (
    <div style={{ padding: 20 }}>
      <Table {...table} />
    </div>
  )
}

export default RootPage
