import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { StatInfo } from '@banx/components/StatInfo'

import { TotalBorrowerStats } from '@banx/api/stats'

import { ChartStatInfo, DashboardStatInfo, Heading } from '../../../components'
import { LoansStatus, STATUS_COLOR_MAP } from './constants'
import { useMyLoans } from './hooks'

import styles from './MyLoans.module.less'

interface MyLoansProps {
  stats?: TotalBorrowerStats | null
}

const MyLoans: FC<MyLoansProps> = ({ stats }) => {
  const { loansData, chartData, buttonProps } = useMyLoans(stats)

  const { totalBorrowed = 0, totalDebt = 0, totalWeeklyInterest = 0 } = stats || {}

  return (
    <div className={styles.loansContainer}>
      <Heading title="My loans" />
      <div className={styles.loansContent}>
        <div className={styles.loansStatsContainer}>
          <div className={styles.loansStats}>
            <DashboardStatInfo
              label="Total debt"
              value={totalDebt}
              classNamesProps={{ container: styles.totalDebt }}
              divider={1e9}
            />
            <div className={styles.separateLine} />
            <div className={styles.additionalStats}>
              <StatInfo flexType="row" label="Total borrowed" value={totalBorrowed} divider={1e9} />
              <StatInfo
                flexType="row"
                label="Weekly interest"
                value={totalWeeklyInterest}
                divider={1e9}
              />
            </div>
          </div>
          <div className={styles.mobileChart}>
            <Doughnut {...chartData} />
          </div>
          <div className={styles.loansChartStats}>
            {loansData.map(({ key, ...props }) => (
              <ChartStatInfo
                key={key}
                indicatorColor={STATUS_COLOR_MAP[key as LoansStatus]}
                {...props}
              />
            ))}
          </div>
        </div>
        <div className={styles.desktopChart}>
          <Doughnut {...chartData} />
        </div>
      </div>
      <Button {...buttonProps} className={styles.manageLoansButton}>
        Manage my loans
      </Button>
    </div>
  )
}

export default MyLoans
