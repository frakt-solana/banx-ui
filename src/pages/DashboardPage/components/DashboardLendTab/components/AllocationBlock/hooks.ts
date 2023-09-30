import { every, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { DoughnutChartProps } from '@banx/components/Charts'

import { TotalLenderStats } from '@banx/api/stats'
import { PATHS } from '@banx/router'

import {
  AllocationStatus,
  NO_DATA_CHART,
  STATUS_COLOR_MAP,
  STATUS_DISPLAY_NAMES,
} from './constants'

export type AllocationStats = TotalLenderStats['allocation']

export const useAllocationBlock = (stats?: AllocationStats) => {
  const navigate = useNavigate()

  const { activeLoans = 0, underWaterLoans = 0, pendingOffers = 0 } = stats || {}

  const totalFunds = activeLoans + underWaterLoans + pendingOffers

  const allocationStatusToValueMap = {
    [AllocationStatus.ActiveLoans]: activeLoans,
    [AllocationStatus.UnderWaterLoans]: underWaterLoans,
    [AllocationStatus.PendingOffers]: pendingOffers,
  }

  const allocationData = map(allocationStatusToValueMap, (value, status) => ({
    label: STATUS_DISPLAY_NAMES[status as AllocationStatus],
    key: status,
    value,
  }))

  const allocationValues = map(allocationData, 'value')
  const isDataEmpty = every(allocationValues, (value) => value === 0)

  const chartData: DoughnutChartProps = {
    data: isDataEmpty ? NO_DATA_CHART.value : allocationValues,
    colors: isDataEmpty ? NO_DATA_CHART.colors : Object.values(STATUS_COLOR_MAP),
    statInfoProps: {
      label: 'Total funds',
      value: totalFunds,
      divider: 1e9,
    },
  }

  const goToPage = (path: string) => () => {
    navigate(path)
  }

  const navigateButtonProps = {
    onClick: isDataEmpty ? goToPage(PATHS.LEND) : goToPage(PATHS.OFFERS),
    text: isDataEmpty ? 'Lend SOL' : 'Manage my offers',
  }

  return {
    allocationData,
    chartData,
    navigateButtonProps,
  }
}
