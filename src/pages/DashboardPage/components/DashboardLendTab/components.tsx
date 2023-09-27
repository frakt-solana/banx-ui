import { FC } from 'react'

import { every, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { Doughnut, SingleBar } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { TotalLenderStats } from '@banx/api/stats'
import { PATHS } from '@banx/router'
import { useMarketsURLControl } from '@banx/store'

import { LendCard } from '../Card'
import { ChartStatInfo, DashboardStatInfo, Heading } from '../components'
import {
  ALLOCATION_COLOR_MAP,
  ALLOCATION_DISPLAY_NAMES,
  ALL_TIME_COLOR_MAP,
  ALL_TIME_DISPLAY_NAMES,
  AllTimeStatus,
  AllocationStatus,
  EMPTY_DOUGHNUT_CHART_DATA,
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
            <DashboardStatInfo
              label="Total lent"
              value={totalLent}
              tooltipText="Weekly interest"
              divider={1e9}
            />
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

interface AllocationBlockProps {
  stats?: TotalLenderStats['allocation']
}

export const AllocationBlock: FC<AllocationBlockProps> = ({ stats }) => {
  const {
    weightedApy = 0,
    weeklyInterest = 0,
    activeLoans = 0,
    underWaterLoans = 0,
    pendingOffers = 0,
  } = stats || {}

  const totalFunds = activeLoans + underWaterLoans + pendingOffers

  const navigate = useNavigate()

  const allocationStatusValueMap = {
    [AllocationStatus.ActiveLoans]: activeLoans,
    [AllocationStatus.UnderWaterLoans]: underWaterLoans,
    [AllocationStatus.PendingOffers]: pendingOffers,
  }

  const allocationData = Object.entries(allocationStatusValueMap).map(([status, value]) => ({
    name: ALLOCATION_DISPLAY_NAMES[status as AllocationStatus],
    key: status,
    value,
  }))

  const goToOffersPage = () => {
    navigate(PATHS.OFFERS)
  }

  const goToLendPage = () => {
    navigate(PATHS.LEND)
  }

  const allocationValues = map(allocationData, 'value')
  const isAllocationDataEmpty = every(allocationValues, (value) => value === 0)

  const DoughnutChart = () => {
    const chartData = isAllocationDataEmpty ? EMPTY_DOUGHNUT_CHART_DATA.value : allocationValues
    const chartColors = isAllocationDataEmpty
      ? EMPTY_DOUGHNUT_CHART_DATA.colors
      : Object.values(ALLOCATION_COLOR_MAP)

    return (
      <Doughnut
        data={chartData}
        colors={chartColors}
        statInfoProps={{
          label: 'Total funds',
          value: totalFunds,
          divider: 1e9,
        }}
        className={styles.doughnutChart}
      />
    )
  }

  return (
    <div className={styles.allocationContainer}>
      <Heading title="Allocation" />
      <div className={styles.allocationContent}>
        <div className={styles.allocationStatsContainer}>
          <div className={styles.allocationStats}>
            <DashboardStatInfo
              label="Weekly interest"
              value={weeklyInterest}
              tooltipText="Weekly interest"
              divider={1e9}
            />
            <DashboardStatInfo
              label="Weighted apy"
              value={weightedApy / 100}
              tooltipText="Weighted apy"
              valueType={VALUES_TYPES.PERCENT}
            />
          </div>
          <div className={styles.mobileChartContainer}>{DoughnutChart()}</div>
          <div className={styles.allocationChartStats}>
            {allocationData.map(({ key, name, value }) => (
              <ChartStatInfo
                key={key}
                label={name}
                value={createSolValueJSX(value, 1e9, '0◎')}
                indicatorColor={ALLOCATION_COLOR_MAP[key as AllocationStatus]}
              />
            ))}
          </div>
        </div>
        <div className={styles.chartContainer}>{DoughnutChart()}</div>
      </div>
      <Button
        onClick={isAllocationDataEmpty ? goToLendPage : goToOffersPage}
        className={styles.manageOffersButton}
      >
        {isAllocationDataEmpty ? 'Lend SOL' : 'Manage my offers'}
      </Button>
    </div>
  )
}
