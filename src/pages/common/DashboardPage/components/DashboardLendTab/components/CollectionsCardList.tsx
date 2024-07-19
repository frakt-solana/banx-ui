import { FC } from 'react'

import { useNavigate } from 'react-router-dom'

import { coreNew } from '@banx/api/nft'
import { LendTabName, useLendTabs } from '@banx/pages/nftLending/LendPage'
import { PATHS } from '@banx/router'
import { useMarketsURLControl } from '@banx/store/common'

import { LendCard } from '../../Card'

import styles from '../DashboardLendTab.module.less'

interface CollectionsCardListProps {
  marketsPreview: coreNew.MarketPreview[]
}

const CollectionsCardList: FC<CollectionsCardListProps> = ({ marketsPreview }) => {
  const { setSelectedMarkets } = useMarketsURLControl()

  const navigate = useNavigate()
  const { setTab: setLendTab } = useLendTabs()

  const goToSelectedMarket = (collectionName: string) => {
    setSelectedMarkets([collectionName])

    setLendTab(LendTabName.PLACE)
    return navigate({ pathname: PATHS.LEND, search: `?collections=${collectionName}` })
  }

  return (
    <div className={styles.collectionsCardList}>
      {marketsPreview.map((market) => (
        <LendCard
          key={market.marketPubkey.toBase58()}
          image={market.collectionImage}
          amountOfLoans={market.activeBondsAmount}
          offerTvl={market.offerTvl.toNumber()}
          apr={market.marketApr.toNumber()}
          onClick={() => goToSelectedMarket(market.collectionName)}
        />
      ))}
    </div>
  )
}
export default CollectionsCardList
