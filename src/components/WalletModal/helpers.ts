import { sumBy } from 'lodash'

import { UserRewards } from '@banx/api/user/types'

export const getUserRewardsValue = (usersRewards?: UserRewards) => {
  if (!usersRewards) return null

  const { lenders, borrowers } = usersRewards
  const unitedUserRewards = [...lenders, ...borrowers]

  const totalUserRewards = sumBy(unitedUserRewards, 'reward') || 0

  return totalUserRewards
}

export const formatBalance = (value: number | null, decimals = 2) => {
  if (value === null || value === undefined) return '--'
  return value.toFixed(decimals)
}
