import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { ChartStatInfo, DashboardStatInfo, Heading } from '../../../components'
import { AllocationStatus, STATUS_COLOR_MAP } from './constants'
import { AllocationStats, useAllocationBlock } from './hooks'

import styles from './AllocationBlock.module.less'

interface AllocationBlockProps {
  stats?: AllocationStats
}

const AllocationBlock: FC<AllocationBlockProps> = ({ stats }) => {
  const { weightedApy = 0, weeklyInterest = 0 } = stats || {}

  const { allocationData, chartData, buttonProps } = useAllocationBlock(stats)

  return (
    <div className={styles.allocationContainer}>
      <Heading title="Allocation" />
      <div className={styles.allocationContent}>
        <div className={styles.allocationStatsContainer}>
          <div className={styles.allocationStats}>
            <DashboardStatInfo
              label="Weekly interest"
              value={weeklyInterest}
              tooltipText="Extrapolated weekly interest based off your current active loans"
              divider={1e9}
            />
            <DashboardStatInfo
              label="Weighted apr"
              value={weightedApy / 100}
              tooltipText="Average annual interest rate of your current active loans"
              valueType={VALUES_TYPES.PERCENT}
            />
          </div>
          <div className={styles.mobileChart}>
            <Doughnut {...chartData} className={styles.doughnutChart} />
          </div>
          <div className={styles.allocationChartStats}>
            {allocationData.map(({ key, label, value }) => (
              <ChartStatInfo
                key={key}
                label={label}
                value={createSolValueJSX(value, 1e9, '0◎')}
                indicatorColor={STATUS_COLOR_MAP[key as AllocationStatus]}
              />
            ))}
          </div>
        </div>
        <div className={styles.desktopChart}>
          <Doughnut {...chartData} className={styles.doughnutChart} />
        </div>
      </div>
      <Button onClick={buttonProps.onClick} className={styles.manageOffersButton}>
        {buttonProps.text}
      </Button>
    </div>
  )
}

export default AllocationBlock
