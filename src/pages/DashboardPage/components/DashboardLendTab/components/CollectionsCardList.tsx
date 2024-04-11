import { FC } from 'react'

import { useNavigate } from 'react-router-dom'

import { MarketPreview } from '@banx/api/core'
import { PATHS } from '@banx/router'
import { useMarketsURLControl } from '@banx/store'
import { trackPageEvent } from '@banx/utils'

import { LendCard } from '../../Card'

import styles from '../DashboardLendTab.module.less'

interface CollectionsCardListProps {
  marketsPreview: MarketPreview[]
}

const CollectionsCardList: FC<CollectionsCardListProps> = ({ marketsPreview }) => {
  const { setSelectedMarkets } = useMarketsURLControl()

  const navigate = useNavigate()

  const goToSelectedMarket = (collectionName: string) => {
    trackPageEvent('dashboard', 'lendtab-collection')
    setSelectedMarkets([collectionName])

    return navigate({ pathname: PATHS.LEND, search: `?collections=${collectionName}` })
  }

  return (
    <div className={styles.collectionsCardList}>
      {marketsPreview.map((market) => (
        <LendCard
          key={market.marketPubkey}
          image={market.collectionImage}
          amountOfLoans={market.activeBondsAmount}
          offerTvl={market.offerTvl}
          apr={market.marketApr}
          onClick={() => goToSelectedMarket(market.collectionName)}
        />
      ))}
    </div>
  )
}
export default CollectionsCardList
