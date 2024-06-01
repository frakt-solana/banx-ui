import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { PATHS } from '@banx/router'
import { createPathWithModeParams } from '@banx/store'
import { ModeType } from '@banx/store/common'
import { createGlobalState } from '@banx/store/createGlobalState'
import { useNftTokenType } from '@banx/store/nft'
import { isSolTokenType } from '@banx/utils'

import { useSortedOffers } from './useSortedOffers'
import { useTokenOffersPreview } from './useTokenOffersPreview'

const useCollectionsStore = createGlobalState<string[]>([])

export const useOffersTokenContent = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useNftTokenType()

  const { offersPreview, isLoading } = useTokenOffersPreview()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const filteredOffers = useMemo(() => {
    if (selectedCollections.length) {
      return filter(offersPreview, ({ tokenMarketPreview }) =>
        includes(selectedCollections, tokenMarketPreview.collateralTokenTicker),
      )
    }
    return offersPreview
  }, [offersPreview, selectedCollections])

  const { sortParams, sortedOffers } = useSortedOffers(filteredOffers)

  const searchSelectParams = createSearchSelectParams({
    options: offersPreview,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const goToLendPage = () => {
    navigate(createPathWithModeParams(PATHS.LEND, ModeType.Token, tokenType))
  }

  const tokenName = isSolTokenType(tokenType) ? 'SOL' : 'USDC'

  const emptyListParams = {
    message: connected
      ? `Lend ${tokenName} to view your your offers`
      : 'Connect wallet to view your offers',
    buttonProps: connected ? { text: 'Lend', onClick: goToLendPage } : undefined,
  }

  const showEmptyList = (!offersPreview.length && !isLoading) || !connected

  return {
    offers: sortedOffers,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    emptyListParams,
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
  const offersGroupedByCollection = groupBy(
    options,
    (offer) => offer.tokenMarketPreview.collateralTokenTicker,
  )

  const searchSelectOptions = map(offersGroupedByCollection, (groupedOffer) => {
    const firstOfferInGroup = first(groupedOffer)
    const { collateralTokenTicker = '', collateralTokenImageUrl = '' } =
      firstOfferInGroup?.tokenMarketPreview || {}

    const accruedInterest = sumBy(groupedOffer, (offer) => offer.tokenOfferPreview.accruedInterest)

    return {
      collateralTokenTicker,
      collateralTokenImageUrl,
      accruedInterest,
    }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    labels: ['Collateral', 'Interest'],
    optionKeys: {
      labelKey: 'collateralTokenTicker',
      valueKey: 'collateralTokenTicker',
      imageKey: 'collateralTokenImageUrl',
      secondLabel: {
        key: 'accruedInterest',
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
  }

  return searchSelectParams
}
