import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { DisplayValue } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'
import { createPathWithModeParams } from '@banx/store'
import { ModeType } from '@banx/store/common'
import { createGlobalState } from '@banx/store/createGlobalState'
import { useNftTokenType } from '@banx/store/nft'
import { isOfferStateClosed, isSolTokenType } from '@banx/utils'

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

  const { tokenType } = useNftTokenType()

  const { offers, updateOrAddOffer, isLoading } = useUserOffers()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  //? Don't show closed offers in the offers list (UI)
  const filteredClosedOffers = offers.filter((offer) => !isOfferStateClosed(offer.offer.pairState))

  const filteredOffers = useMemo(() => {
    if (selectedCollections.length) {
      return filter(filteredClosedOffers, ({ collectionMeta }) =>
        includes(selectedCollections, collectionMeta.collectionName),
      )
    }
    return filteredClosedOffers
  }, [filteredClosedOffers, selectedCollections])

  const { sortParams, sortedOffers } = useSortedOffers(filteredOffers)

  const searchSelectOptions = useMemo(() => {
    const offersGroupedByCollection = groupBy(
      filteredClosedOffers,
      ({ collectionMeta }) => collectionMeta.collectionName,
    )

    return map(offersGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.collectionMeta || {}
      const lent = sumBy(groupedLoan, ({ offer }) => offer.edgeSettlement)

      return { collectionName, collectionImage, lent }
    })
  }, [filteredClosedOffers])

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
    navigate(createPathWithModeParams(PATHS.LEND, ModeType.NFT, tokenType))
  }

  const tokenName = isSolTokenType(tokenType) ? 'SOL' : 'USDC'

  const emptyListParams = {
    message: connected
      ? `Lend ${tokenName} to view your pending offers`
      : 'Connect wallet to view your offers',
    buttonProps: connected ? { text: 'Lend', onClick: goToLendPage } : undefined,
  }

  const showEmptyList = (!filteredClosedOffers.length && !isLoading) || !connected

  return {
    offersToDisplay: sortedOffers,
    offers,

    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    emptyListParams,
    updateOrAddOffer,
  }
}
