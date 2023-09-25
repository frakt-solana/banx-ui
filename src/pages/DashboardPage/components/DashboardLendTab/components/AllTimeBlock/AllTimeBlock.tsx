import { SingleBar } from '@banx/components/Charts'

import { ChartStatInfo, DashboardStatInfo } from '../../../components'
import { ALL_TIME_COLOR_MAP, ALL_TIME_DISPLAY_NAMES, AllTimeStatus } from './constants'

import styles from './AllTimeBlock.module.less'

const AllTimeBlock = () => {
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
      <h4 className={styles.allTimeHeading}>All time</h4>
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

export default AllTimeBlock
