import { useState } from 'react'

import { isEmpty } from 'lodash'

import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'
import { useMarketsPreview } from '@banx/pages/LendPage'

import BorrowCard from './components/BorrowCard'

import styles from './RequestLoansContent.module.less'

export const RequestLoansContent = () => {
  const { marketsPreview, isLoading: isLoadingMarkets } = useMarketsPreview()

  const { data: markets, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: marketsPreview })

  const [visibleMarketPubkey, setMarketPubkey] = useState('')

  const onCardClick = (marketPubkey: string) => {
    const isSameMarketPubkey = visibleMarketPubkey === marketPubkey
    const nextValue = !isSameMarketPubkey ? marketPubkey : ''
    return setMarketPubkey(nextValue)
  }

  const isLoading = isLoadingMarkets && isEmpty(marketsPreview)

  return (
    <div className={styles.content}>
      {isLoading && <Loader />}

      {!isLoading && (
        <div className={styles.marketsList}>
          {markets.map((market) => (
            <BorrowCard
              key={market.marketPubkey}
              market={market}
              onClick={() => onCardClick(market.marketPubkey)}
              isOpen={visibleMarketPubkey === market.marketPubkey}
            />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
    </div>
  )
}
