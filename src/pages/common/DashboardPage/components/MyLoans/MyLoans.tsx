import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { ChartStat } from '..'
import { STATUS_COLOR_MAP } from './constants'
import { useMyLoans } from './hooks'

import styles from './MyLoans.module.less'

const MyLoans = () => {
  const { loansData, chartData, buttonProps, totalBorrowed, totalDebt, totalWeeklyInterest } =
    useMyLoans()

  return (
    <div className={styles.container}>
      <h4 className={styles.heading}>My loans</h4>

      <div className={styles.content}>
        <div className={styles.statsContainer}>
          <MainStats
            totalDebt={totalDebt}
            totalBorrowed={totalBorrowed}
            totalWeeklyInterest={totalWeeklyInterest}
          />

          <div className={styles.mobileChart}>
            <Doughnut {...chartData} />
          </div>

          <div className={styles.loansChartStats}>
            {loansData.map(({ key, ...props }) => (
              <ChartStat key={key} indicatorColor={STATUS_COLOR_MAP[key]} {...props} />
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

interface MainStatsProps {
  totalDebt: number
  totalBorrowed: number
  totalWeeklyInterest: number
}

const MainStats: FC<MainStatsProps> = ({ totalDebt, totalBorrowed, totalWeeklyInterest }) => {
  return (
    <div className={styles.mainStats}>
      <StatInfo
        label="Total debt"
        value={<DisplayValue value={totalDebt} />}
        classNamesProps={{
          container: styles.totalDebtStat,
          label: styles.totalDebtStatLabel,
          value: styles.totalDebtStatValue,
        }}
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
  )
}
