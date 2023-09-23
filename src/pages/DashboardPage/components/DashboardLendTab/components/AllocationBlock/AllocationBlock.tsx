import { Button } from '@banx/components/Buttons'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { ChartStatInfo, DashboardStatInfo } from '../../../DashboardStatInfo'
import { ALLOCATION_COLOR_MAP, AllocationStatus } from './constants'

import styles from './AllocationBlock.module.less'

const AllocationBlock = () => {
  return (
    <>
      <h4 className={styles.allocationHeading}>Allocation</h4>
      <div className={styles.allocationContent}>
        <div className={styles.allocationStatsContainer}>
          <div className={styles.allocationStats}>
            <DashboardStatInfo label="Weekly interest" value={15.5} tooltipText="Weekly interest" />
            <DashboardStatInfo
              label="Weighted apy"
              value={130}
              tooltipText="Weighted apy"
              valueType={VALUES_TYPES.PERCENT}
            />
          </div>
          <div className={styles.allocationChartStats}>
            <ChartStatInfo
              label="Active loans"
              value="10"
              indicatorColor={ALLOCATION_COLOR_MAP[AllocationStatus.ActiveLoans]}
            />
            <ChartStatInfo
              label="Under water loans"
              value="10"
              indicatorColor={ALLOCATION_COLOR_MAP[AllocationStatus.UnderWaterLoans]}
            />
            <ChartStatInfo
              label="Pending offers"
              value="10"
              indicatorColor={ALLOCATION_COLOR_MAP[AllocationStatus.PendingOffers]}
            />
          </div>
        </div>
        <div className={styles.chart}></div>
      </div>
      <Button className={styles.manageOffersButton}>Manage my offers</Button>
    </>
  )
}

export default AllocationBlock
