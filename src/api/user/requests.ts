import axios from 'axios'

import { BACKEND_DOMAIN } from '@frakt/constants'

import { UserRewards } from './types'

type FetchUserRewards = (props: { publicKey: string }) => Promise<UserRewards>
export const fetchUserRewards: FetchUserRewards = async ({ publicKey }) => {
  const { data } = await axios.get<UserRewards>(
    `https://${BACKEND_DOMAIN}/stats/rewards/${publicKey}`,
  )

  return data
}
