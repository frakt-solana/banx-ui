import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useWalletLoans } from '../../hooks'
import { LoansActiveTable } from '../LoansActiveTable'

const LoansActiveTab = () => {
  const { publicKey } = useWallet()
  const { loans } = useWalletLoans(publicKey as any)
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
    <div style={{ padding: 16 }}>
      <LoansActiveTable
        data={loans}
        searchSelectParams={searchSelectParams}
        sortParams={{ option: sortOption, onChange: setSortOption }}
      />
    </div>
  )
}

export default LoansActiveTab

const mockOptions = [
  {
    collectionName: 'Banx',
    collectionImage: 'https://banxnft.s3.amazonaws.com/images/6906.png',
  },
  {
    collectionName: 'ABC',
    collectionImage: 'https://banxnft.s3.amazonaws.com/images/19542.png',
  },
  {
    collectionName: 'Tensorian',
    collectionImage: 'https://banxnft.s3.amazonaws.com/images/18952.png',
  },
]
