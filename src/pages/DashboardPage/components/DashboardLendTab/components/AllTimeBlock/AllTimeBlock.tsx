import { FC } from 'react'

import { SingleBar } from '@banx/components/Charts'

import { ChartStatInfo, DashboardStatInfo, Heading } from '../../../components'
import { AllTimeStatus, STATUS_COLOR_MAP } from './constants'
import { AllTimeStats, useAllTimeBlock } from './hooks'

import styles from './AllTimeBlock.module.less'

interface AllTimeBlockProps {
  stats?: AllTimeStats
}

const AllTimeBlock: FC<AllTimeBlockProps> = ({ stats }) => {
  const { totalInterestEarned = 0, totalLent = 0 } = stats || {}

  const { allTimeData, chartData } = useAllTimeBlock(stats)

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
