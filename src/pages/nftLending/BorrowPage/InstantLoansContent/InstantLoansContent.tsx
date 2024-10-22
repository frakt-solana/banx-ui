import { FC, useState } from 'react'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { useMarketsPreview } from '../../LendPage'
import { HeaderList } from './components/HeaderList'
import { MarketBorrowCard } from './components/MarketBorrowCard'

import styles from './InstantLoansContent.module.less'

type InstantLoansContentProps = {
  goToRequestLoanTab: () => void
}

export const InstantLoansContent: FC<InstantLoansContentProps> = ({ goToRequestLoanTab }) => {
  //TODO get markets that user has on wallet
  const { marketsPreview, isLoading } = useMarketsPreview()

  const [expandedMarketPublicKey, setExpandedMarketPublicKey] = useState('')

  const handleCardToggle = (marketPubkey: string) => {
    setExpandedMarketPublicKey((prev) => (prev === marketPubkey ? '' : marketPubkey))
  }

  const showEmptyList = !marketsPreview.length && !isLoading

  //TODO No markets found is disconnected and no suitable nfts if connected
  if (showEmptyList) return <EmptyList message={'No markets found'} />

  return (
    <div className={styles.content}>
      <HeaderList />

      {isLoading && <Loader />}

      {!showEmptyList && (
        <div className={styles.cardsList}>
          {marketsPreview.map((preview) => (
            <MarketBorrowCard
              key={preview.marketPubkey}
              marketPreview={preview}
              onClick={() => handleCardToggle(preview.marketPubkey)}
              isExpanded={expandedMarketPublicKey === preview.marketPubkey}
              goToRequestLoanTab={goToRequestLoanTab}
            />
          ))}
        </div>
      )}
    </div>
  )
}
