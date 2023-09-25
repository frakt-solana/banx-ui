import { map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { Doughnut, SingleBar } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
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
} from './constants'

import styles from './DashboardLendTab.module.less'

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

export const AllTimeBlock = () => {
  const allTimeStatusValueMap = {
    [AllTimeStatus.Repaid]: 10,
    [AllTimeStatus.Interest]: 20,
  }

  const allTimeData = Object.entries(allTimeStatusValueMap).map(([status, value]) => ({
    label: ALL_TIME_DISPLAY_NAMES[status as AllTimeStatus],
    color: ALL_TIME_COLOR_MAP[status as AllTimeStatus],
    key: status,
    value,
  }))

  return (
    <div className={styles.allTimeContainer}>
      <Heading title="All time" />
      <div className={styles.allTimeContent}>
        <div className={styles.allTimeStatsContainer}>
          <div className={styles.allTimeStats}>
            <DashboardStatInfo label="Total lent" value={15.5} tooltipText="Weekly interest" />
            <DashboardStatInfo label="Total interest earned" value={130} />
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
        <SingleBar data={allTimeData} />
      </div>
    </div>
  )
}

export const AllocationBlock = () => {
  //? MOCK DATA
  const weightedApy = 130
  const weeklyInterest = 130
  const activeLoans = 10
  const underWaterLoans = 20
  const pendingOffers = 30
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
            />
            <DashboardStatInfo
              label="Weighted apy"
              value={weightedApy}
              tooltipText="Weighted apy"
              valueType={VALUES_TYPES.PERCENT}
            />
          </div>
          <div className={styles.allocationChartStats}>
            {allocationData.map(({ key, name, value }) => (
              <ChartStatInfo
                key={key}
                label={name}
                value={createSolValueJSX(value)}
                indicatorColor={ALLOCATION_COLOR_MAP[key as AllocationStatus]}
              />
            ))}
          </div>
        </div>
        <Doughnut
          data={map(allocationData, 'value')}
          colors={Object.values(ALLOCATION_COLOR_MAP)}
          statInfoProps={{ label: 'Total funds', value: totalFunds, decimalPlaces: 0 }}
          className={styles.doughnutChart}
        />
      </div>
      <Button onClick={goToOffersPage} className={styles.manageOffersButton}>
        Manage my offers
      </Button>
    </div>
  )
}
