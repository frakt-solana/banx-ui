import { FC } from 'react'

import { every, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { TotalBorrowerStats } from '@banx/api/stats'
import { PATHS } from '@banx/router'

import { ChartStatInfo, DashboardStatInfo, Heading } from '../components'
import {
  EMPTY_DOUGHNUT_CHART_DATA,
  LOANS_COLOR_MAP,
  LOANS_DISPLAY_NAMES,
  LoansStatus,
} from './constants'

import styles from './DashboardBorrowTab.module.less'

interface MyLoansProps {
  stats?: TotalBorrowerStats | null
}
export const MyLoans: FC<MyLoansProps> = ({ stats }) => {
  const navigate = useNavigate()
  const {
    activeLoansCount = 0,
    terminatingLoansCount = 0,
    liquidationLoansCount = 0,
    totalBorrowed = 0,
    totalDebt = 0,
  } = stats || {}

  const totalLoans = activeLoansCount + terminatingLoansCount + liquidationLoansCount

  const loansStatusValueMap = {
    [LoansStatus.Active]: activeLoansCount,
    [LoansStatus.Terminating]: terminatingLoansCount,
    [LoansStatus.Liquidation]: liquidationLoansCount,
  }

  const loansData = Object.entries(loansStatusValueMap).map(([status, value]) => ({
    label: LOANS_DISPLAY_NAMES[status as LoansStatus],
    key: status,
    value,
    className: status === LoansStatus.Liquidation ? styles.highlightLiquidation : '',
  }))

  const goToLoansPage = () => {
    navigate(PATHS.LOANS)
  }

  const loansValues = map(loansData, 'value')
  const isLoansDataEmpty = every(loansValues, (value) => value === 0)

  const DoughnutChart = () => {
    const chartData = isLoansDataEmpty ? EMPTY_DOUGHNUT_CHART_DATA.value : loansValues
    const chartColors = isLoansDataEmpty
      ? EMPTY_DOUGHNUT_CHART_DATA.colors
      : Object.values(LOANS_COLOR_MAP)

    return (
      <Doughnut
        data={chartData}
        colors={chartColors}
        statInfoProps={{ label: 'Total loans', value: totalLoans, valueType: VALUES_TYPES.STRING }}
        className={styles.doughnutChart}
      />
    )
  }

  return (
    <div className={styles.loansContainer}>
      <Heading title="My loans" />
      <div className={styles.loansContent}>
        <div className={styles.loansStatsContainer}>
          <div className={styles.loansStats}>
            <DashboardStatInfo label="Total borrowed" value={totalBorrowed} divider={1e9} />
            <DashboardStatInfo label="Total debt" value={totalDebt} divider={1e9} />
          </div>
          <div className={styles.mobileChartContainer}>{DoughnutChart()}</div>
          <div className={styles.loansChartStats}>
            {loansData.map(({ key, ...props }) => (
              <ChartStatInfo
                key={key}
                indicatorColor={LOANS_COLOR_MAP[key as LoansStatus]}
                {...props}
              />
            ))}
          </div>
        </div>
        <div className={styles.chartContainer}>{DoughnutChart()}</div>
      </div>
      <Button
        onClick={goToLoansPage}
        className={styles.manageLoansButton}
        disabled={isLoansDataEmpty}
      >
        Manage my loans
      </Button>
    </div>
  )
}
