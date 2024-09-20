import { every, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { DoughnutChartProps } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { stats } from '@banx/api/nft'
import { PATHS } from '@banx/router'
import { createPathWithModeParams } from '@banx/store'
import { getRouteForMode, useModeType } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { isBanxSolTokenType } from '@banx/utils'

import {
  LoansStatus,
  NO_DATA_CHART_DATA,
  STATUS_COLOR_MAP,
  STATUS_DISPLAY_NAMES,
} from './constants'

import styles from './MyLoans.module.less'

export const useMyLoans = (stats?: stats.TotalBorrowerStats | null) => {
  const navigate = useNavigate()

  const { tokenType } = useNftTokenType()
  const { modeType } = useModeType()

  const { activeLoansCount = 0, terminatingLoansCount = 0, liquidationLoansCount = 0 } = stats || {}

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
    const newPath = getRouteForMode(PATHS.LOANS, modeType)
    navigate(createPathWithModeParams(newPath, modeType, tokenType))
  }

  const goToLoansPage = () => {
    const newPath = getRouteForMode(PATHS.LOANS, modeType)
    navigate(createPathWithModeParams(newPath, modeType, tokenType))
  }

  const emptyButtonText = isBanxSolTokenType(tokenType) ? 'Borrow SOL' : 'Borrow USDC'

  const buttonProps = {
    onClick: isDataEmpty ? goToBorrowPage : goToLoansPage,
    text: isDataEmpty ? emptyButtonText : 'Manage my loans',
  }

  return { loansData, buttonProps, chartData }
}
