import { map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'

import { PATHS } from '@banx/router'

import { ChartStatInfo, DashboardStatInfo } from '../../../DashboardStatInfo'
import { LOANS_COLOR_MAP, LOANS_DISPLAY_NAMES, LoansStatus } from './constants'

import styles from './MyLoans.module.less'

const MyLoans = () => {
  const navigate = useNavigate()

  const loansStatusValueMap = {
    [LoansStatus.Active]: 10,
    [LoansStatus.Terminating]: 20,
    [LoansStatus.Liquidation]: 30,
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
            <DashboardStatInfo label="Total borrowed" value={15.5} />
            <DashboardStatInfo label="Total debt" value={130} />
          </div>
          <div className={styles.loansChartStats}>
            {loansData.map(({ key, name, value }) => (
              <ChartStatInfo
                key={key}
                label={name}
                value={value}
                indicatorColor={LOANS_COLOR_MAP[key as LoansStatus]}
              />
            ))}
          </div>
        </div>
        <Doughnut
          data={map(loansData, 'value')}
          colors={Object.values(LOANS_COLOR_MAP)}
          statLabel="Total loans"
          statValue={123}
        />
      </div>
      <Button onClick={goToLoansPage} className={styles.manageLoansButton}>
        Manage my loans
      </Button>
    </div>
  )
}

export default MyLoans
