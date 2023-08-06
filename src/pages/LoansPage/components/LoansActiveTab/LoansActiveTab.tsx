import React, { useState } from 'react'

import { mockData, mockOptions } from '@banx/pages/RootPage/constants'

import { LoansActiveTable } from '../LoansActiveTable'

const LoansActiveTab = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<any>({
    label: 'Borrow',
    value: 'maxLoanValue_desc',
  })

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

  return (
    <div>
      <LoansActiveTable
        data={mockData}
        searchSelectParams={searchSelectParams}
        sortParams={{ option: sortOption, onChange: setSortOption }}
      />
    </div>
  )
}

export default LoansActiveTab
