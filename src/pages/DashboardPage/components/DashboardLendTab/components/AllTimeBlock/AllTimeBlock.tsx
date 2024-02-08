import { FC } from 'react'

import { every, map } from 'lodash'

import { SingleBar } from '@banx/components/Charts'
import { StatInfo } from '@banx/components/StatInfo'

import { TotalLenderStats } from '@banx/api/stats'

import { ChartStatInfo, DashboardStatInfo, Heading } from '../../../components'
import {
  AllTimeStatus,
  NO_DATA_CHART_DATA,
  STATUS_COLOR_MAP,
  STATUS_DISPLAY_NAMES,
} from './constants'

import styles from './AllTimeBlock.module.less'

type AllTimeStats = TotalLenderStats['allTime']

interface AllTimeBlockProps {
  stats?: AllTimeStats
}

const AllTimeBlock: FC<AllTimeBlockProps> = ({ stats }) => {
  const { paidInterest = 0, pendingInterest = 0, totalLent = 0 } = stats || {}

  const { allTimeData, chartData } = getAllTimeStatsData(stats)

  return (
    <div className={styles.allTimeContainer}>
      <Heading title="All time" />
      <div className={styles.allTimeContent}>
        <div className={styles.allTimeStatsContainer}>
          <div className={styles.allTimeStats}>
            <DashboardStatInfo
              classNamesProps={{ container: styles.totalLent }}
              label="Total lent"
              value={totalLent}
              divider={1e9}
            />
            <div className={styles.separateLine} />
            <div className={styles.interestStats}>
              <StatInfo
                flexType="row"
                label="Pending interest"
                value={pendingInterest}
                divider={1e9}
              />
              <StatInfo flexType="row" label="Earned interest" value={paidInterest} divider={1e9} />
            </div>
          </div>
          <div className={styles.allTimeChartStats}>
            {allTimeData.map(({ key, label, value }) => (
              <ChartStatInfo
                key={key}
                label={label}
                value={value}
                indicatorColor={STATUS_COLOR_MAP[key as AllTimeStatus]}
              />
            ))}
          </div>
        </div>
        <SingleBar data={chartData} className={styles.singleBarChart} />
      </div>
    </div>
  )
}

export default AllTimeBlock

const getAllTimeStatsData = (stats?: AllTimeStats) => {
  const { totalRepaid = 0, totalDefaulted = 0 } = stats || {}

  const allTimeStatusValueMap = {
    [AllTimeStatus.Repaid]: totalRepaid,
    [AllTimeStatus.Defaulted]: totalDefaulted,
  }

  const allTimeData = map(allTimeStatusValueMap, (value, status) => ({
    label: STATUS_DISPLAY_NAMES[status as AllTimeStatus],
    color: STATUS_COLOR_MAP[status as AllTimeStatus],
    key: status,
    value,
  }))

  const isDataEmpty = every(map(allTimeData, 'value'), (value) => value === 0)

  const chartData = isDataEmpty ? [NO_DATA_CHART_DATA] : allTimeData

  return {
    allTimeData,
    chartData,
  }
}
