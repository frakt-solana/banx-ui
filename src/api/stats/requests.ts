import axios from 'axios'

import { BACKEND_BASE_URL } from '@banx/constants'

import {
  AllTotalStats,
  AllTotalStatsSchema,
  TotalBorrowerStats,
  TotalBorrowerStatsSchema,
  TotalLenderStats,
  TotalLenderStatsSchema,
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

type FetchAllTotalStats = () => Promise<AllTotalStats | null>
export const fetchAllTotalStats: FetchAllTotalStats = async () => {
  try {
    const { data } = await axios.get<{ data: AllTotalStats }>(`${BACKEND_BASE_URL}/stats/all`)

    try {
      await AllTotalStatsSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}

type FetchLenderStats = (walletPubkey: string) => Promise<TotalLenderStats | null>
export const fetchLenderStats: FetchLenderStats = async (walletPubkey) => {
  try {
    const { data } = await axios.get<{ data: TotalLenderStats }>(
      `${BACKEND_BASE_URL}/stats/lend/${walletPubkey}`,
    )

    try {
      await TotalLenderStatsSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}

type FetchBorrowerStats = (walletPubkey: string) => Promise<TotalBorrowerStats | null>
export const fetchBorrowerStats: FetchBorrowerStats = async (walletPubkey) => {
  try {
    const { data } = await axios.get<{ data: TotalBorrowerStats }>(
      `${BACKEND_BASE_URL}/stats/borrow/${walletPubkey}`,
    )

    try {
      await TotalBorrowerStatsSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}
