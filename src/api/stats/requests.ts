import axios from 'axios'

import { BACKEND_BASE_URL } from '@banx/constants'

import {
  UserLoansStats,
  UserLoansStatsResponse,
  UserOffersStats,
  UserOffersStatsResponse,
  UserOffersStatsSchema,
} from './types'

type FetchUserOffersStats = (walletPubkey: string) => Promise<UserOffersStats | null>

export const fetchUserOffersStats: FetchUserOffersStats = async (walletPubkey) => {
  try {
    const { data } = await axios.get<UserOffersStatsResponse>(
      `${BACKEND_BASE_URL}/stats/my-offers/${walletPubkey}`,
    )

    try {
      await UserOffersStatsSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}

type FetchUserLoansStats = (walletPubkey: string) => Promise<UserLoansStats | null>

export const fetchUserLoansStats: FetchUserLoansStats = async (walletPubkey) => {
  try {
    const { data } = await axios.get<UserLoansStatsResponse>(
      `${BACKEND_BASE_URL}/stats/my-loans/${walletPubkey}`,
    )

    try {
      await UserOffersStatsSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}
