import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_DOMAIN } from '@frakt/constants'

import { UserRewards } from './types'

type FetchUserRewards = (props: { publicKey: web3.PublicKey }) => Promise<UserRewards>
export const fetchUserRewards: FetchUserRewards = async ({ publicKey }) => {
  const { data } = await axios.get<UserRewards>(
    `${BACKEND_DOMAIN}/stats/rewards/${publicKey?.toBase58() || ''}`,
  )

  return data
}
