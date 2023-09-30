import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'

import { TotalBorrowerStats } from '@banx/api/stats'

import { ChartStatInfo, DashboardStatInfo, Heading } from '../../../components'
import { LoansStatus, STATUS_COLOR_MAP } from './constants'
import { useMyLoans } from './hooks'

import styles from './MyLoans.module.less'

interface MyLoansProps {
  stats?: TotalBorrowerStats | null
}

const MyLoans: FC<MyLoansProps> = ({ stats }) => {
  const { loansData, chartData, buttonProps } = useMyLoans()

  const { totalBorrowed = 0, totalDebt = 0 } = stats || {}

  return (
    <div className={styles.loansContainer}>
      <Heading title="My loans" />
      <div className={styles.loansContent}>
        <div className={styles.loansStatsContainer}>
          <div className={styles.loansStats}>
            <DashboardStatInfo label="Total borrowed" value={totalBorrowed} divider={1e9} />
            <DashboardStatInfo label="Total debt" value={totalDebt} divider={1e9} />
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
