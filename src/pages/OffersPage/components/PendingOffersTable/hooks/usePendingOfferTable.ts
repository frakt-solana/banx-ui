import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { useUserOffers } from '@banx/pages/OffersPage/hooks'
import { PATHS } from '@banx/router'
import { calculateLoanValue } from '@banx/utils'

import {
  DEFAULT_SORT_OPTION,
  EMPTY_MESSAGE,
  NOT_CONNECTED_MESSAGE,
  SORT_OPTIONS,
} from '../constants'
import { parseUserOffers } from '../helpers'
import { useSortedOffers } from './useSortedOffers'

import styles from '../PendingOffersTable.module.less'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  bestOffer: number
}

export const usePendingOfferTable = () => {
  const { offers, loading } = useUserOffers()
  const { connected } = useWallet()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const offersGroupedByCollection = groupBy(offers, (offer) => offer.collectionName)

    return map(offersGroupedByCollection, (groupedOffers) => {
      const firstLoanInGroup = first(groupedOffers)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup || {}

      const sortedOffers = groupedOffers.sort((offerA, offerB) => {
        return calculateLoanValue(offerB) - calculateLoanValue(offerA)
      })

      const bestOfferLoanValue = calculateLoanValue(sortedOffers[0])

      return { collectionName, collectionImage, bestOffer: bestOfferLoanValue }
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
    className: styles.searchSelect,
  }

  const parsedUserOffers = parseUserOffers(offers)
  const sortedOffers = useSortedOffers(parsedUserOffers, sortOption.value)

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
    options: SORT_OPTIONS,
  }

  const showEmptyList = (!offers?.length && !loading) || !connected

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonText: connected ? 'Lend $SOL' : '',
    path: connected ? PATHS.LEND : '',
  }

  return {
    offers: sortedOffers,
    loading,
    showEmptyList,
    emptyListParams,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
