import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { SortOption } from '@banx/components/SortDropdown'

import { fetchBorrowerActivity } from '@banx/api/activity'

import { DEFAULT_SORT_OPTION } from '../constants'

export const useBorrowerActivity = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const [sortBy, order] = sortOption.value.split('_')

  const { data, isLoading } = useQuery(
    ['borrowerActivity', publicKeyString, sortOption, selectedCollections],
    () =>
      fetchBorrowerActivity({
        walletPubkey: publicKeyString,
        sortBy,
        order,
        collection: selectedCollections,
      }),
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
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
    },
    selectedCollections,
    setSelectedCollections,
  }
}
