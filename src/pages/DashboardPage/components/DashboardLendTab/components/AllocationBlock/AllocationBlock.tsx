import { Button } from '@banx/components/Buttons'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { ChartPie } from '../../../ChartPie'
import { ChartStatInfo, DashboardStatInfo } from '../../../DashboardStatInfo'
import { ALLOCATION_COLOR_MAP, ALLOCATION_DISPLAY_NAMES, AllocationStatus } from './constants'

import styles from './AllocationBlock.module.less'

const AllocationBlock = () => {
  const statusValueMap = {
    [AllocationStatus.ActiveLoans]: 10,
    [AllocationStatus.UnderWaterLoans]: 20,
    [AllocationStatus.PendingOffers]: 30,
  }

  const allocationData = Object.entries(statusValueMap).map(([status, value]) => ({
    name: ALLOCATION_DISPLAY_NAMES[status as AllocationStatus],
    key: status,
    value,
  }))

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
            {allocationData.map(({ key, name, value }) => (
              <ChartStatInfo
                key={key}
                label={name}
                value={value}
                indicatorColor={ALLOCATION_COLOR_MAP[key as AllocationStatus]}
              />
            ))}
          </div>
        </div>
        <ChartPie
          data={allocationData}
          colors={Object.values(ALLOCATION_COLOR_MAP)}
          label="Total funds"
          value={27}
        />
      </div>
      <Button className={styles.manageOffersButton}>Manage my offers</Button>
    </>
  )
}

export default AllocationBlock
