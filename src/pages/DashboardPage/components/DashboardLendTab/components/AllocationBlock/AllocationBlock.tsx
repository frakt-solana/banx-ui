import { map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'

import { ChartStatInfo, DashboardStatInfo } from '../../../components'
import { ALLOCATION_COLOR_MAP, ALLOCATION_DISPLAY_NAMES, AllocationStatus } from './constants'

import styles from './AllocationBlock.module.less'

//? MOCK DATA
const weightedApy = 130
const weeklyInterest = 130
const activeLoans = 10
const underWaterLoans = 20
const pendingOffers = 30
const totalFunds = activeLoans + underWaterLoans + pendingOffers

const AllocationBlock = () => {
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
      <h4 className={styles.allocationHeading}>Allocation</h4>
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

export default AllocationBlock
