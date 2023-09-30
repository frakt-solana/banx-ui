import { FC } from 'react'

import { every, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SingleBar } from '@banx/components/Charts'

import { MarketPreview } from '@banx/api/core'
import { TotalLenderStats } from '@banx/api/stats'
import { PATHS } from '@banx/router'
import { useMarketsURLControl } from '@banx/store'

import { LendCard } from '../Card'
import { ChartStatInfo, DashboardStatInfo, Heading } from '../components'
import {
  ALL_TIME_COLOR_MAP,
  ALL_TIME_DISPLAY_NAMES,
  AllTimeStatus,
  EMPTY_SINGLE_BAR_CHART_DATA,
} from './constants'

import styles from './DashboardLendTab.module.less'

interface CollectionsCardListProps {
  marketsPreview: MarketPreview[]
}
export const CollectionsCardList: FC<CollectionsCardListProps> = ({ marketsPreview }) => {
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
          apr={market.marketApr}
          onClick={() => goToSelectedMarket(market.collectionName)}
        />
      ))}
    </div>
  )
}

interface AllTimeBlockProps {
  stats?: TotalLenderStats['allTime']
}
export const AllTimeBlock: FC<AllTimeBlockProps> = ({ stats }) => {
  const {
    totalRepaid = 0,
    totalInterestEarned = 0,
    totalLent = 0,
    totalDefaulted = 0,
  } = stats || {}

  const allTimeStatusValueMap = {
    [AllTimeStatus.Repaid]: totalRepaid,
    [AllTimeStatus.Defaulted]: totalDefaulted,
  }

  const allTimeData = Object.entries(allTimeStatusValueMap).map(([status, value]) => ({
    label: ALL_TIME_DISPLAY_NAMES[status as AllTimeStatus],
    color: ALL_TIME_COLOR_MAP[status as AllTimeStatus],
    key: status,
    value,
  }))

  const isDataEmpty = every(map(allTimeData, 'value'), (value) => value === 0)

  return (
    <div className={styles.allTimeContainer}>
      <Heading title="All time" />
      <div className={styles.allTimeContent}>
        <div className={styles.allTimeStatsContainer}>
          <div className={styles.allTimeStats}>
            <DashboardStatInfo label="Total lent" value={totalLent} divider={1e9} />
            <DashboardStatInfo
              label="Total interest earned"
              value={totalInterestEarned}
              divider={1e9}
            />
          </div>
          <div className={styles.allTimeChartStats}>
            {allTimeData.map(({ key, label, value }) => (
              <ChartStatInfo
                key={key}
                label={label}
                value={value}
                indicatorColor={ALL_TIME_COLOR_MAP[key as AllTimeStatus]}
              />
            ))}
          </div>
        </div>
        <SingleBar
          data={isDataEmpty ? [EMPTY_SINGLE_BAR_CHART_DATA] : allTimeData}
          className={styles.singleBarChart}
        />
      </div>
    </div>
  )
}
