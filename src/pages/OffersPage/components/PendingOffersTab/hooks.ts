import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { first, groupBy, map } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { fetchUserOffers } from '@banx/api/core'
import { DEFAULT_SORT_OPTION } from '@banx/pages/LoansPage/constants'

export const useUserOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['userOffers', publicKeyString],
    () => fetchUserOffers({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    offers: data ?? [],
    loading: isLoading,
  }
}

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
}

export const usePendingOfferTab = () => {
  const { offers, loading } = useUserOffers()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const offersGroupedByCollection = groupBy(offers, (offer) => offer.collectionName)

    return map(offersGroupedByCollection, (groupedOffer) => {
      const firstLoanInGroup = first(groupedOffer)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup || {}

      // TODO: need calc best offer
      const bestOffer = firstLoanInGroup?.fundsSolOrTokenBalance

      return { collectionName, collectionImage, bestOffer }
    })
  }, [offers])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'bestOffer',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions,
    labels: ['Collection', 'Best offer'],
    onChange: setSelectedOptions,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
  }

  return {
    offers,
    loading,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
