import { useState } from 'react'

import { SearchSelect } from '@banx/components/SearchSelect'
import Table from '@banx/components/Table'
import { Tabs, useTabs } from '@banx/components/Tabs'

import { getTableList } from './columns'
import { mockData, mockOptions } from './constants'

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

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const searchSelectParams = {
    options: mockOptions,
    placeholder: 'Select a collection',
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'nftsCount' },
    },
    selectedOptions,
    labels: ['Collections', 'Nfts'],
    onChange: setSelectedOptions,
  }

  const { tabs, value, setValue } = useTabs({ tabs: POOLS_TABS })

  return (
    <>
      <Tabs tabs={tabs} value={value} setValue={setValue} />
      <SearchSelect {...searchSelectParams} />
      <div style={{ padding: 20 }}>
        <Table {...table} />
      </div>
    </>
  )
}

export default RootPage
