import { useMemo, useState } from 'react'

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
import { isBanxSolTokenType } from '@banx/utils'

import { useSortedOffers } from './useSortedOffers'
import { useTokenOffersPreview } from './useTokenOffersPreview'

const useCollectionsStore = createGlobalState<string[]>([])

export const useOffersTokenContent = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useNftTokenType()

  const { offersPreview, isLoading } = useTokenOffersPreview()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()
  const [visibleOfferPubkey, setOfferPubkey] = useState('')

  const onCardClick = (offerPubkey: string) => {
    const isSameOfferPubkey = visibleOfferPubkey === offerPubkey
    const nextValue = !isSameOfferPubkey ? offerPubkey : ''
    return setOfferPubkey(nextValue)
  }

  const filteredOffers = useMemo(() => {
    if (selectedCollections.length) {
      return filter(offersPreview, ({ tokenMarketPreview }) =>
        includes(selectedCollections, tokenMarketPreview.collateral.ticker),
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

  const tokenName = isBanxSolTokenType(tokenType) ? 'SOL' : 'USDC'

  const emptyListParams = {
    message: connected
      ? `Lend ${tokenName} to view your your offers`
      : 'Connect wallet to view your offers',
    buttonProps: connected ? { text: 'Lend', onClick: goToLendPage } : undefined,
  }

  const showEmptyList = (!offersPreview.length && !isLoading) || !connected

  return {
    offersPreview: sortedOffers,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    emptyListParams,
    visibleOfferPubkey,
    onCardClick,
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

    const accruedInterest = sumBy(groupedOffer, (offer) => offer.tokenOfferPreview.accruedInterest)

    return { ticker, logoUrl, accruedInterest }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    labels: ['Collateral', 'Interest'],
    optionKeys: {
      labelKey: 'ticker',
      valueKey: 'ticker',
      imageKey: 'logoUrl',
      secondLabel: {
        key: 'accruedInterest',
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
  }

  return searchSelectParams
}
