import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { DisplayValue } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode, useTokenType } from '@banx/store/common'
import { createGlobalState } from '@banx/store/createGlobalState'
import { getTokenTicker, isOfferStateClosed } from '@banx/utils'

import { useSortedOffers } from './useSortedOffers'
import { useUserOffers } from './useUserOffers'

const useCollectionsStore = createGlobalState<string[]>([])

export const useOffersContent = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useTokenType()

  const { offers, isLoading, marketsPreview } = useUserOffers({
    refetchInterval: 30 * 1000,
  })

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()
  const [visibleOfferPubkey, setOfferPubkey] = useState('')

  const onCardClick = (offerPubkey: string) => {
    const isSameOfferPubkey = visibleOfferPubkey === offerPubkey
    const nextValue = !isSameOfferPubkey ? offerPubkey : ''
    return setOfferPubkey(nextValue)
  }

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

  const searchSelectParams = {
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
    navigate(buildUrlWithModeAndToken(PATHS.LEND, AssetMode.NFT, tokenType))
  }

  const emptyListParams = {
    message: connected
      ? `Lend ${getTokenTicker(tokenType)} to view your pending offers`
      : 'Connect wallet to view your offers',
    buttonProps: connected ? { text: 'Lend', onClick: goToLendPage } : undefined,
  }

  const showEmptyList = (!filteredClosedOffers.length && !isLoading) || !connected

  return {
    offersToDisplay: sortedOffers,
    isLoading,

    marketsPreview,
    visibleOfferPubkey,
    onCardClick,

    sortParams,
    searchSelectParams,
    emptyListParams,
    showEmptyList,
  }
}
