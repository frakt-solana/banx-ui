import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { ChartStat } from '..'
import { AllocationStatus, STATUS_COLOR_MAP } from './constants'
import { useAllocationBlock } from './hooks'

import styles from './AllocationBlock.module.less'

interface AllocationBlockProps {
  stats?: any
}

const AllocationBlock: FC<AllocationBlockProps> = ({ stats }) => {
  const { weightedApy = 0, weeklyInterest = 0 } = stats?.allocation || {}
  const { paidInterest = 0, pendingInterest = 0, totalLent = 0 } = stats?.allTime || {}

  const { allocationData, chartData, buttonProps } = useAllocationBlock(stats?.allocation)

  const tooltipContent = createTooltipContent({
    paidInterest,
    pendingInterest,
    totalLent,
    weightedApy,
  })

  const mainStatClassNames = {
    container: styles.mainStat,
    label: styles.mainStatLabel,
    value: styles.mainStatValue,
  }

  return (
    <div className={styles.allocationContainer}>
      <div className={styles.allocationHeader}>
        <h4 className={styles.heading}>Allocation</h4>
        <Tooltip title={tooltipContent} trigger="click" overlayClassName={styles.tooltip}>
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

interface CreateTooltipContentProps {
  totalLent: number
  pendingInterest: number
  paidInterest: number
  weightedApy: number
}

const createTooltipContent = ({
  totalLent,
  pendingInterest,
  paidInterest,
  weightedApy,
}: CreateTooltipContentProps) => {
  const mainStatClassNames = {
    container: styles.mainStat,
    label: styles.mainStatLabel,
    value: styles.mainStatValue,
  }

  return (
    <div className={styles.tooltipContent}>
      <div className={styles.allTimeStats}>
        <StatInfo
          classNamesProps={mainStatClassNames}
          label="Total lent"
          value={<DisplayValue value={totalLent} />}
        />

        <div className={styles.separateLine} />

        <div className={styles.interestStats}>
          <StatInfo
            flexType="row"
            label="Pending interest"
            value={<DisplayValue value={pendingInterest} />}
          />
          <StatInfo
            label="Earned interest"
            value={<DisplayValue value={paidInterest} />}
            flexType="row"
          />
        </div>
      </div>

      <StatInfo
        value={weightedApy / 100}
        flexType="row"
        label="Weighted apr"
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo value={0} flexType="row" label="Defaulted" />
    </div>
  )
}
