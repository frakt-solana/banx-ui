import { FC, useMemo, useState } from 'react'

import { filter, map } from 'lodash'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { BorrowNft, MarketPreview } from '@banx/api/nft'
import { createGlobalState } from '@banx/store'

import { useBorrowNftsAndMarketsQuery, useMaxLoanValueByMarket } from '../hooks'
import { FilterSection } from './components/FilterSection'
import { HeaderList } from './components/HeaderList'
import { MarketBorrowCard } from './components/MarketBorrowCard'

import styles from './InstantLoansContent.module.less'

type InstantLoansContentProps = {
  goToRequestLoanTab: () => void
}

const useCollectionsStore = createGlobalState<string[]>([])

export const InstantLoansContent: FC<InstantLoansContentProps> = ({ goToRequestLoanTab }) => {
  const { marketsPreview, nftsByMarket, userVaults, offersByMarket, isLoading } =
    useBorrowNftsAndMarketsQuery()

  const maxLoanValueByMarket = useMaxLoanValueByMarket({ offersByMarket, userVaults })

  const [expandedMarketPublicKey, setExpandedMarketPublicKey] = useState('')
  const [selectedCollections, setCollections] = useCollectionsStore()

  const handleCardToggle = (marketPubkey: string) => {
    setExpandedMarketPublicKey((prev) => (prev === marketPubkey ? '' : marketPubkey))
  }

  const filteredMarketsByCollection = useMemo(() => {
    if (!selectedCollections.length) return marketsPreview

    return filter(marketsPreview, (preview) => selectedCollections.includes(preview.collectionName))
  }, [marketsPreview, selectedCollections])

  const searchSelectParams = createSearchSelectParams({
    options: filteredMarketsByCollection,
    selectedOptions: selectedCollections,
    onChange: setCollections,
    nftsByMarket,
  })

  const showEmptyList = !isLoading && !marketsPreview.length

  if (showEmptyList) return <EmptyList message="You don't have any whitelisted collections" />

  return (
    <div className={styles.content}>
      <FilterSection searchSelectParams={searchSelectParams} />

      <HeaderList />

      {isLoading && <Loader />}

      {!showEmptyList && (
        <div className={styles.cardsList}>
          {filteredMarketsByCollection.map((preview) => (
            <MarketBorrowCard
              key={preview.marketPubkey}
              maxLoanValue={maxLoanValueByMarket[preview.marketPubkey] || 0}
              marketPreview={preview}
              onClick={() => handleCardToggle(preview.marketPubkey)}
              isExpanded={expandedMarketPublicKey === preview.marketPubkey}
              goToRequestLoanTab={goToRequestLoanTab}
              nftsAmount={nftsByMarket[preview.marketPubkey].length}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CreateSearchSelectProps {
  options: MarketPreview[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
  nftsByMarket: Record<string, BorrowNft[]>
}

const createSearchSelectParams = ({
  options,
  selectedOptions,
  onChange,

  nftsByMarket,
}: CreateSearchSelectProps) => {
  const searchSelectOptions = map(options, (option) => {
    const { collectionImage = '', collectionName = '', marketPubkey } = option || {}
    const nftsAmount = nftsByMarket[marketPubkey]?.length || 0

    return { collectionImage, collectionName, marketPubkey, nftsAmount }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    labels: ['Collection', 'NFTs'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'nftsAmount',
      },
    },
  }

  return searchSelectParams
}
