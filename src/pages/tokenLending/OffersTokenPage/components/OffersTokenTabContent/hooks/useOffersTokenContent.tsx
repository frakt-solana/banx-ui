import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { DisplayValue } from '@banx/components/TableComponents'

import { MarketCategory, core } from '@banx/api/tokens'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode, useTokenType } from '@banx/store/common'
import { createGlobalState } from '@banx/store/createGlobalState'
import { getTokenTicker, isOfferStateClosed } from '@banx/utils'

import { useSortedOffers } from './useSortedOffers'
import { useTokenOffersPreview } from './useTokenOffersPreview'

const useCollectionsStore = createGlobalState<string[]>([])

export const useOffersTokenContent = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useTokenType()

  const { offersPreview, updateOrAddOffer, isLoading } = useTokenOffersPreview()

  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>(MarketCategory.All)
  const [selectedCollections, setSelectedCollections] = useCollectionsStore()
  const [visibleOfferPubkey, setOfferPubkey] = useState('')

  const onChangeCategory = (category: MarketCategory) => {
    setSelectedCategory(category)
  }

  const onCardClick = (offerPubkey: string) => {
    const isSameOfferPubkey = visibleOfferPubkey === offerPubkey
    const nextValue = !isSameOfferPubkey ? offerPubkey : ''
    return setOfferPubkey(nextValue)
  }

  //? Don't show closed offers in the offers list (UI)
  const filteredClosedOffers = offersPreview.filter(
    (offer) => !isOfferStateClosed(offer.bondOffer.pairState),
  )

  const rawOffers = useMemo(() => {
    return map(offersPreview, ({ bondOffer }) => bondOffer)
  }, [offersPreview])

  const filteredByCategory = useMemo(() => {
    if (selectedCategory === MarketCategory.All) return filteredClosedOffers

    return filteredClosedOffers.filter((preview) =>
      preview.tokenMarketPreview.marketCategory.includes(selectedCategory),
    )
  }, [filteredClosedOffers, selectedCategory])

  const filteredOffers = useMemo(() => {
    if (!selectedCollections.length) return filteredByCategory

    return filter(filteredByCategory, ({ tokenMarketPreview }) =>
      includes(selectedCollections, tokenMarketPreview.collateral.ticker),
    )
  }, [filteredByCategory, selectedCollections])

  const { sortParams, sortedOffers } = useSortedOffers(filteredOffers)

  const searchSelectParams = createSearchSelectParams({
    options: filteredClosedOffers,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const goToLendPage = () => {
    navigate(buildUrlWithModeAndToken(PATHS.LEND, AssetMode.Token, tokenType))
  }

  const emptyListParams = {
    message: connected
      ? `Lend ${getTokenTicker(tokenType)} to view your offers`
      : 'Connect wallet to view your offers',
    buttonProps: connected ? { text: 'Lend', onClick: goToLendPage } : undefined,
  }

  const showEmptyList = (!filteredOffers.length && !isLoading) || !connected

  return {
    offersToDisplay: sortedOffers,
    rawOffers,
    updateOrAddOffer,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    emptyListParams,
    visibleOfferPubkey,
    onCardClick,

    selectedCategory,
    onChangeCategory,
  }
}

interface CreateSearchSelectProps {
  options: core.TokenOfferPreview[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  options,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const offersGroupedByTicker = groupBy(
    options,
    (offer) => offer.tokenMarketPreview.collateral.ticker,
  )

  const searchSelectOptions = map(offersGroupedByTicker, (groupedOffer) => {
    const firstOfferInGroup = first(groupedOffer)
    const { ticker = '', logoUrl = '' } = firstOfferInGroup?.tokenMarketPreview.collateral || {}

    const lent = sumBy(groupedOffer, (offer) => offer.tokenOfferPreview.inLoans)

    return { ticker, logoUrl, lent }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    labels: ['Collateral', 'Lent'],
    optionKeys: {
      labelKey: 'ticker',
      valueKey: 'ticker',
      imageKey: 'logoUrl',
      secondLabel: {
        key: 'lent',
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
  }

  return searchSelectParams
}
