import { every, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { DoughnutChartProps } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { useBorrowerStats } from '@banx/pages/common/DashboardPage/hooks'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { useAssetMode, useTokenType } from '@banx/store/common'
import { isBanxSolTokenType } from '@banx/utils'

import {
  LoansStatus,
  NO_DATA_CHART_DATA,
  STATUS_COLOR_MAP,
  STATUS_DISPLAY_NAMES,
} from './constants'

import styles from './MyLoans.module.less'

export const useMyLoans = () => {
  const { data: borrowerStats } = useBorrowerStats()

  const {
    totalBorrowed = 0,
    totalDebt = 0,
    totalWeeklyInterest = 0,
    activeLoansCount = 0,
    terminatingLoansCount = 0,
    liquidationLoansCount = 0,
  } = borrowerStats || {}

  const navigate = useNavigate()

  const { tokenType } = useTokenType()
  const { currentAssetMode } = useAssetMode()

  const totalLoans = activeLoansCount + terminatingLoansCount + liquidationLoansCount

  const loansStatusToValueMap = {
    [LoansStatus.Active]: activeLoansCount,
    [LoansStatus.Terminating]: terminatingLoansCount,
    [LoansStatus.Liquidation]: liquidationLoansCount,
  }

  const loansData = map(loansStatusToValueMap, (value, status) => ({
    label: STATUS_DISPLAY_NAMES[status as LoansStatus],
    key: status as LoansStatus,
    value,
  }))

  const loansValues = map(loansData, (loan) => loan.value)
  const isDataEmpty = every(loansValues, (value) => value === 0)

  const chartData: DoughnutChartProps = {
    data: isDataEmpty ? NO_DATA_CHART_DATA.value : loansValues,
    colors: isDataEmpty ? NO_DATA_CHART_DATA.colors : Object.values(STATUS_COLOR_MAP),
    className: styles.doughnutChart,
    statInfoProps: {
      label: 'Total loans',
      value: totalLoans,
      valueType: VALUES_TYPES.STRING,
    },
  }

  const goToBorrowPage = () => {
    navigate(buildUrlWithModeAndToken(PATHS.BORROW, currentAssetMode, tokenType))
  }

  const goToLoansPage = () => {
    navigate(buildUrlWithModeAndToken(PATHS.LOANS, currentAssetMode, tokenType))
  }

  const emptyButtonText = isBanxSolTokenType(tokenType) ? 'Borrow SOL' : 'Borrow USDC'

  const buttonProps = {
    onClick: isDataEmpty ? goToBorrowPage : goToLoansPage,
    text: isDataEmpty ? emptyButtonText : 'Manage my loans',
  }

  return { loansData, buttonProps, chartData, totalBorrowed, totalDebt, totalWeeklyInterest }
}
