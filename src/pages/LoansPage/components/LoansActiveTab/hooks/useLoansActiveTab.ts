import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { SortOption } from '@banx/components/SortDropdown'

import { defaultSortOption } from '@banx/pages/LoansPage/constants'
import { useWalletLoans } from '@banx/pages/LoansPage/hooks'

import { useFilteredLoans } from './useFilteredLoans'
import { useSortedLoans } from './useSortedLoans'

export type SearchSelectOption = {
  collectionName: string
  collectionImage: string
}

export const useLoansActiveTab = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { loans, isLoading } = useWalletLoans(publicKeyString)

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(defaultSortOption)

  const filteredLoans = useFilteredLoans(loans, selectedOptions)
  const sortedLoans = useSortedLoans(filteredLoans, sortOption.value)

  return {
    loans: sortedLoans,
    loading: isLoading,
    sortViewParams: {
      searchSelectParams: {
        options: mockOptions,
        optionKeys: {
          labelKey: 'collectionName',
          valueKey: 'collectionName',
          imageKey: 'collectionImage',
          secondLabel: { key: 'nftsCount' },
        },
        selectedOptions,
        labels: ['Collections', 'Nfts'],
        onChange: setSelectedOptions,
      },
      sortParams: { option: sortOption, onChange: setSortOption },
    },
  }
}

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
