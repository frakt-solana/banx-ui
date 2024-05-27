import { every, map, sum, values } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { DoughnutChartProps } from '@banx/components/Charts'
import { DisplayValue } from '@banx/components/TableComponents'

import { stats } from '@banx/api/nft'
import { PATHS } from '@banx/router'
import { ModeType, createPathWithParams } from '@banx/store/common'
import { useTokenType } from '@banx/store/nft'
import { getTokenDecimals, isSolTokenType } from '@banx/utils'

import {
  AllocationStatus,
  NO_DATA_CHART_DATA,
  STATUS_COLOR_MAP,
  STATUS_DISPLAY_NAMES,
} from './constants'

export type AllocationStats = stats.TotalLenderStats['allocation']

export const useAllocationBlock = (stats?: AllocationStats) => {
  const navigate = useNavigate()
  const { tokenType } = useTokenType()

  const {
    activeLoans = 0,
    underWaterLoans = 0,
    pendingOffers = 0,
    terminatingLoans = 0,
  } = stats || {}

  const allocationStatusToValueMap = {
    [AllocationStatus.Pending]: pendingOffers,
    [AllocationStatus.Active]: activeLoans,
    [AllocationStatus.Underwater]: underWaterLoans,
    [AllocationStatus.Terminating]: terminatingLoans,
  }

  const allocationData = map(allocationStatusToValueMap, (value, status) => ({
    label: STATUS_DISPLAY_NAMES[status as AllocationStatus],
    key: status,
    value,
  }))

  const totalFunds = sum(values(allocationStatusToValueMap))

  const decimals = getTokenDecimals(tokenType)

  const allocationValues = map(allocationData, ({ value }) => value / decimals)
  const isDataEmpty = every(allocationValues, (value) => value === 0)

  const chartData: DoughnutChartProps = {
    data: isDataEmpty ? NO_DATA_CHART_DATA.value : allocationValues,
    colors: isDataEmpty ? NO_DATA_CHART_DATA.colors : Object.values(STATUS_COLOR_MAP),
    statInfoProps: {
      label: 'Total funds',
      value: <DisplayValue value={totalFunds} />,
    },
  }

  const goToLendPage = () => {
    navigate(createPathWithParams(PATHS.LEND, ModeType.NFT, tokenType))
  }
  const goToOffersPage = () => {
    navigate(createPathWithParams(PATHS.OFFERS, ModeType.NFT, tokenType))
  }

  const emptyButtonText = isSolTokenType(tokenType) ? 'Lend SOL' : 'Lend USDC'

  const buttonProps = {
    onClick: isDataEmpty ? goToLendPage : goToOffersPage,
    text: isDataEmpty ? emptyButtonText : 'Manage my offers',
  }

  return {
    allocationData,
    chartData,
    buttonProps,
  }
}
