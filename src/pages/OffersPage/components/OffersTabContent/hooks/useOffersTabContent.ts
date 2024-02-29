import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'
import { createCollectionsStore } from '@banx/store/functions'
import { formatDecimal } from '@banx/utils'

import { useSortedOffers } from './useSortedOffers'
import { useUserOffers } from './useUserOffers'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  lent: number
}

const useCollectionsStore = createCollectionsStore()

export const useOffersContent = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { offers, updateOrAddOffer, isLoading } = useUserOffers()

  const { selectedCollections, setSelectedCollections } = useCollectionsStore()

  const filteredOffers = useMemo(() => {
    if (selectedCollections.length) {
      return filter(offers, ({ collectionMeta }) =>
        includes(selectedCollections, collectionMeta.collectionName),
      )
    }
    return offers
  }, [offers, selectedCollections])

  const { sortParams, sortedOffers } = useSortedOffers(filteredOffers)

  const searchSelectOptions = useMemo(() => {
    const offersGroupedByCollection = groupBy(
      offers,
      ({ collectionMeta }) => collectionMeta.collectionName,
    )

    return map(offersGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.collectionMeta || {}
      const lent = sumBy(groupedLoan, ({ offer }) => offer.edgeSettlement)

      return { collectionName, collectionImage, lent }
    })
  }, [offers])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    selectedOptions: selectedCollections,
    labels: ['Collection', 'Lent'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'lent',
        format: (value: number) => createSolValueJSX(value, 1e9, '0◎', formatDecimal),
      },
    },
    onChange: setSelectedCollections,
  }

  const goToLendPage = () => {
    navigate(PATHS.LEND)
  }

  const emptyListParams = {
    message: connected
      ? 'Lend SOL to view your pending offers'
      : 'Connect wallet to view your offers',
    buttonProps: connected ? { text: 'Lend', onClick: goToLendPage } : undefined,
  }

  const showEmptyList = (!offers.length && !isLoading) || !connected

  return {
    offers: sortedOffers,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    emptyListParams,
    updateOrAddOffer,
  }
}
