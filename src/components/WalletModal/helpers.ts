import { map, sum } from 'lodash'

import { UserRewards } from '@frakt/api/user/types'

export const getUserRewardsValue = (usersRewards?: UserRewards) => {
  if (!usersRewards) return '--'

  const { lenders, borrowers } = usersRewards
  const unitedUserRewards = [...lenders, ...borrowers]

  const totalUserRewards = sum(map(unitedUserRewards, 'reward')) || 0

  return totalUserRewards.toFixed(2)
}
