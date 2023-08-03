import Table, { useTable } from '@banx/components/Table'

import { getTableList } from './columns'
import { mockData } from './constants'

const RootPage = () => {
  const columns = getTableList()

  const { table } = useTable({
    data: mockData,
    columns,
    defaultField: 'activeBondsAmount',
  })

  return <Table {...table} />
}

export default RootPage
