import { map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'

import { ChartStatInfo, DashboardStatInfo } from '../components'
import { LOANS_COLOR_MAP, LOANS_DISPLAY_NAMES, LoansStatus } from './constants'

import styles from './DashboardBorrowTab.module.less'

//? MOCK DATA
const activeLoans = 10
const terminatingLoans = 10
const liquidationLoans = 10
const totalLoans = activeLoans + terminatingLoans + liquidationLoans
const totalBorrowed = 15.5
const totalDebt = 130

const MyLoans = () => {
  const navigate = useNavigate()

  const loansStatusValueMap = {
    [LoansStatus.Active]: activeLoans,
    [LoansStatus.Terminating]: terminatingLoans,
    [LoansStatus.Liquidation]: liquidationLoans,
  }

  const loansData = Object.entries(loansStatusValueMap).map(([status, value]) => ({
    name: LOANS_DISPLAY_NAMES[status as LoansStatus],
    key: status,
    value,
  }))

  const goToLoansPage = () => {
    navigate(PATHS.LOANS)
  }

  return (
    <div className={styles.loansContainer}>
      <h4 className={styles.loansHeading}>My loans</h4>
      <div className={styles.loansContent}>
        <div className={styles.loansStatsContainer}>
          <div className={styles.loansStats}>
            <DashboardStatInfo label="Total borrowed" value={totalBorrowed} />
            <DashboardStatInfo label="Total debt" value={totalDebt} />
          </div>
          <div className={styles.loansChartStats}>
            {loansData.map(({ key, name, value }) => (
              <ChartStatInfo
                key={key}
                label={name}
                value={createSolValueJSX(value)}
                indicatorColor={LOANS_COLOR_MAP[key as LoansStatus]}
              />
            ))}
          </div>
        </div>
        <Doughnut
          className={styles.doughnutChart}
          data={map(loansData, 'value')}
          colors={Object.values(LOANS_COLOR_MAP)}
          statInfoProps={{ label: 'Total loans', value: totalLoans }}
        />
      </div>
      <Button onClick={goToLoansPage} className={styles.manageLoansButton}>
        Manage my loans
      </Button>
    </div>
  )
}

export default MyLoans
