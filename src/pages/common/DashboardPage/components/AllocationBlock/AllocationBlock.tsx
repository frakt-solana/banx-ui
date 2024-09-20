import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { TotalLenderStats } from '@banx/api/nft'

import { ChartStat } from '..'
import { AllocationStatus, STATUS_COLOR_MAP } from './constants'
import { useAllocationBlock } from './hooks'

import styles from './AllocationBlock.module.less'

const AllocationBlock = () => {
  const { allocationData, chartData, buttonProps, allTimeStats, weightedApy, weeklyInterest } =
    useAllocationBlock()

  const tooltipContent = createTooltipContent(allTimeStats)

  const mainStatClassNames = {
    container: styles.mainStat,
    label: styles.mainStatLabel,
    value: styles.mainStatValue,
  }

  return (
    <div className={styles.allocationContainer}>
      <div className={styles.allocationHeader}>
        <h4 className={styles.heading}>Allocation</h4>

        <Tooltip title={tooltipContent} overlayClassName={styles.tooltip}>
          <>
            <Button size="medium" type="circle" variant="tertiary">
              History
            </Button>
          </>
        </Tooltip>
      </div>

      <div className={styles.allocationContent}>
        <div className={styles.allocationStatsContainer}>
          <div className={styles.allocationStats}>
            <StatInfo
              label="Weekly interest"
              value={<DisplayValue value={weeklyInterest} />}
              tooltipText="Extrapolated weekly interest based off your current active loans"
              classNamesProps={mainStatClassNames}
            />
            <StatInfo
              label="Weighted apr"
              value={weightedApy / 100}
              tooltipText="Average annual interest rate of your current active loans"
              valueType={VALUES_TYPES.PERCENT}
              classNamesProps={mainStatClassNames}
            />
          </div>
          <div className={styles.mobileChart}>
            <Doughnut {...chartData} className={styles.doughnutChart} />
          </div>
          <div className={styles.allocationChartStats}>
            {allocationData.map(({ key, label, value }) => (
              <ChartStat
                key={key}
                label={label}
                value={<DisplayValue value={value} />}
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

const createTooltipContent = (allTimeStats: TotalLenderStats['allTime'] | undefined) => {
  const {
    paidInterest = 0,
    pendingInterest = 0,
    totalLent = 0,
    totalDefaulted = 0,
  } = allTimeStats || {}

  const mainStatClassNames = {
    container: styles.mainStat,
    label: styles.mainStatLabel,
    value: styles.mainStatValue,
  }

  return (
    <div className={styles.tooltipContent}>
      <div className={styles.allTimeStats}>
        <StatInfo
          label="Total lent"
          classNamesProps={mainStatClassNames}
          value={<DisplayValue value={totalLent} />}
        />

        <div className={styles.separateLine} />

        <div className={styles.interestStats}>
          <StatInfo
            label="Pending interest"
            value={<DisplayValue value={pendingInterest} />}
            flexType="row"
          />
          <StatInfo
            label="Earned interest"
            value={<DisplayValue value={paidInterest} />}
            flexType="row"
          />
        </div>
      </div>

      <StatInfo value={totalDefaulted} flexType="row" label="Defaulted" />
    </div>
  )
}
