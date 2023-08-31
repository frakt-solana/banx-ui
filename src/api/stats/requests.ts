import axios from 'axios'

import { BACKEND_BASE_URL } from '@banx/constants'

import { UserOffersStatsResponse, UserOffersStatsSchema } from './types'

type FetchUserOffersStats = (
  walletPubkey: string,
) => Promise<UserOffersStatsResponse['data'] | null>

export const fetchUserOffersStats: FetchUserOffersStats = async (walletPubkey) => {
  try {
    const { data } = await axios.get<UserOffersStatsResponse>(
      `${BACKEND_BASE_URL}/stats/my-offers/${walletPubkey}`,
    )

    try {
      await UserOffersStatsSchema.array().parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}
