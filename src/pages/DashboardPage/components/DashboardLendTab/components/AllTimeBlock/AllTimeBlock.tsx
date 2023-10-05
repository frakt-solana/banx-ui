import { FC } from 'react'

import { every, map } from 'lodash'

import { SingleBar } from '@banx/components/Charts'

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
  const { totalInterestEarned = 0, totalLent = 0 } = stats || {}

  const { allTimeData, chartData } = getAllTimeStatsData(stats)

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
