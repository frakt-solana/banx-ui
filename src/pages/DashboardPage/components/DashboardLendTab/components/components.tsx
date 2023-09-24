import { useNavigate } from 'react-router-dom'

import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { PATHS } from '@banx/router'
import { useMarketsURLControl } from '@banx/store'

import { LendCard } from '../../Card'

import styles from '../DashboardLendTab.module.less'

export const CollectionsCardList = () => {
  const { marketsPreview } = useMarketsPreview()
  const { setSelectedMarkets, setMarketVisibility } = useMarketsURLControl()

  const navigate = useNavigate()

  const goToSelectedMarket = (collectionName: string) => {
    setMarketVisibility(collectionName, true)
    setSelectedMarkets([collectionName])

    return navigate({
      pathname: PATHS.LEND,
      search: `?opened=${collectionName}&collections=${collectionName}`,
    })
  }

  return (
    <div className={styles.collectionsCardList}>
      {marketsPreview.map((market) => (
        <LendCard
          key={market.marketPubkey}
          image={market.collectionImage}
          amountOfLoans={market.activeBondsAmount}
          offerTvl={market.offerTvl}
          apy={market.marketApr}
          onClick={() => goToSelectedMarket(market.collectionName)}
        />
      ))}
    </div>
  )
}
