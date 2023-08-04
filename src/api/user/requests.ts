import axios from 'axios'

import { BACKEND_BASE_URL } from '@banx/constants'

import { UserRewards } from './types'

type FetchUserRewards = (props: { publicKey: string }) => Promise<UserRewards>
export const fetchUserRewards: FetchUserRewards = async ({ publicKey }) => {
  const { data } = await axios.get<UserRewards>(`${BACKEND_BASE_URL}/stats/rewards/${publicKey}`)

  return data
}
