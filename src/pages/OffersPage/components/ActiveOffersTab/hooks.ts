import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { SortOption } from '@banx/components/SortDropdown'

import { fetchLenderLoans } from '@banx/api/core'

import { DEFAULT_SORT_OPTION } from '../../constants'

export const useLenderLoans = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['walletLoans', publicKeyString],
    () => fetchLenderLoans({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    loans: data ?? [],
    isLoading,
  }
}

export const useActiveOffersTab = () => {
  const { loans } = useLenderLoans()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectParams = {
    options: mockOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
    },
    selectedOptions,
    labels: ['Collection', 'Taken'],
    onChange: setSelectedOptions,
  }

  return {
    loans,
    sortViewParams: {
      searchSelectParams,
      sortParams: { option: sortOption, onChange: setSortOption },
    },
  }
}

const mockOptions = [
  {
    collectionName: 'Banx',
    collectionImage: 'https://banxnft.s3.amazonaws.com/images/6906.png',
  },
]
