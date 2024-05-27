import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { DisplayValue } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'
import { ModeType, createPathWithParams } from '@banx/store/common'
import { createGlobalState } from '@banx/store/createGlobalState'
import { useTokenType } from '@banx/store/nft'
import { isSolTokenType } from '@banx/utils'

import { useSortedOffers } from './useSortedOffers'
import { useUserOffers } from './useUserOffers'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  lent: number
}

const useCollectionsStore = createGlobalState<string[]>([])

export const useOffersContent = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useTokenType()

  const { offers, updateOrAddOffer, isLoading } = useUserOffers()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

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
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
    onChange: setSelectedCollections,
  }

  const goToLendPage = () => {
    navigate(createPathWithParams(PATHS.LEND, ModeType.NFT, tokenType))
  }

  const tokenName = isSolTokenType(tokenType) ? 'SOL' : 'USDC'

  const emptyListParams = {
    message: connected
      ? `Lend ${tokenName} to view your pending offers`
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
