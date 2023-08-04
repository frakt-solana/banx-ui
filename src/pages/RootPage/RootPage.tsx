import Table from '@banx/components/Table'
import { Tabs, useTabs } from '@banx/components/Tabs'

import { getTableList } from './columns'
import { mockData } from './constants'

const POOLS_TABS = [
  {
    label: 'Deposit',
    value: 'deposit',
  },
  {
    label: 'Withdraw',
    value: 'withdraw',
  },
  {
    label: 'Harvest',
    value: 'harvest',
  },
]

const RootPage = () => {
  const columns = getTableList()

  const table = {
    data: mockData,
    columns,
  }

  const { tabs, value, setValue } = useTabs({ tabs: POOLS_TABS })

  return (
    <>
      <Tabs tabs={tabs} value={value} setValue={setValue} />
      <div style={{ padding: 20 }}>
        <Table {...table} />
      </div>
    </>
  )
}

export default RootPage
