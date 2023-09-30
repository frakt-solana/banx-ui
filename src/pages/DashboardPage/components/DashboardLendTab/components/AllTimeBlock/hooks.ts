import { every, map } from 'lodash'

import { TotalLenderStats } from '@banx/api/stats'

import {
  STATUS_COLOR_MAP,
  STATUS_DISPLAY_NAMES,
  AllTimeStatus,
  NO_DATA_CHART,
} from './constants'

export type AllTimeStats = TotalLenderStats['allTime']

export const useAllTimeBlock = (stats?: AllTimeStats) => {
  const { totalRepaid = 0, totalDefaulted = 0 } = stats || {}

  const allTimeStatusValueMap = {
    [AllTimeStatus.Repaid]: totalRepaid,
    [AllTimeStatus.Defaulted]: totalDefaulted,
  }

  const allTimeData = map(allTimeStatusValueMap, (value, status) => ({
    label: STATUS_DISPLAY_NAMES[status as AllTimeStatus],
    color: STATUS_COLOR_MAP[status as AllTimeStatus],
    key: status,
    value,
  }))

  const isDataEmpty = every(map(allTimeData, 'value'), (value) => value === 0)

  const chartData = isDataEmpty ? [NO_DATA_CHART] : allTimeData

  return {
    allTimeData,
    chartData,
  }
}
