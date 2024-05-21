import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { stats } from '@banx/api/nft'

import { ChartStatInfo, DashboardStatInfo, Heading } from '../../../components'
import { LoansStatus, STATUS_COLOR_MAP } from './constants'
import { useMyLoans } from './hooks'

import styles from './MyLoans.module.less'

interface MyLoansProps {
  stats?: stats.TotalBorrowerStats | null
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
              classNamesProps={{ container: styles.totalDebt }}
              label="Total debt"
              value={<DisplayValue value={totalDebt} />}
            />
            <div className={styles.separateLine} />
            <div className={styles.additionalStats}>
              <StatInfo
                label="Total borrowed"
                value={<DisplayValue value={totalBorrowed} />}
                flexType="row"
              />
              <StatInfo
                label="Weekly interest"
                value={<DisplayValue value={totalWeeklyInterest} />}
                flexType="row"
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
