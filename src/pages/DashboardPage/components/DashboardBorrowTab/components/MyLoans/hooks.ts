import { every, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { DoughnutChartProps } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { TotalBorrowerStats } from '@banx/api/stats'
import { PATHS } from '@banx/router'
import { trackPageEvent } from '@banx/utils'

import {
  LoansStatus,
  NO_DATA_CHART_DATA,
  STATUS_COLOR_MAP,
  STATUS_DISPLAY_NAMES,
} from './constants'

import styles from './MyLoans.module.less'

export const useMyLoans = (stats?: TotalBorrowerStats | null) => {
  const navigate = useNavigate()

  const { activeLoansCount = 0, terminatingLoansCount = 0, liquidationLoansCount = 0 } = stats || {}

  const totalLoans = activeLoansCount + terminatingLoansCount + liquidationLoansCount

  const loansStatusToValueMap = {
    [LoansStatus.Active]: activeLoansCount,
    [LoansStatus.Terminating]: terminatingLoansCount,
    [LoansStatus.Liquidation]: liquidationLoansCount,
  }

  const loansData = map(loansStatusToValueMap, (value, status) => ({
    className: liquidationLoansCount && styles.highlightLiquidation,
    label: STATUS_DISPLAY_NAMES[status as LoansStatus],
    key: status,
    value,
  }))

  const loansValues = map(loansData, 'value')
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

  const goToLoansPage = () => {
    trackPageEvent('dashboard', 'borrowtab-manage')
    navigate(PATHS.LOANS)
  }

  const buttonProps = {
    onClick: goToLoansPage,
    disabled: isDataEmpty,
  }

  return { loansData, buttonProps, chartData }
}
