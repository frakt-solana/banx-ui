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
  UserLoansStatsSchema,
  UserOffersStats,
  UserOffersStatsResponse,
  UserOffersStatsSchema,
} from './types'

type FetchUserOffersStats = (walletPubkey: string) => Promise<UserOffersStats | null>

export const fetchUserOffersStats: FetchUserOffersStats = async (walletPubkey) => {
  const { data } = await axios.get<UserOffersStatsResponse>(
    `${BACKEND_BASE_URL}/stats/my-offers/${walletPubkey}`,
  )

  try {
    await UserOffersStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? null
}

type FetchUserLoansStats = (walletPubkey: string) => Promise<UserLoansStats | null>

export const fetchUserLoansStats: FetchUserLoansStats = async (walletPubkey) => {
  const { data } = await axios.get<UserLoansStatsResponse>(
    `${BACKEND_BASE_URL}/stats/my-loans/${walletPubkey}`,
  )

  try {
    await UserLoansStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? null
}

type FetchAllTotalStats = (marketType: 'allInSol' | 'allInUsdc') => Promise<AllTotalStats | null>
export const fetchAllTotalStats: FetchAllTotalStats = async (marketType) => {
  const { data } = await axios.get<{ data: AllTotalStats }>(
    `${BACKEND_BASE_URL}/stats/all?${marketType}`,
  )

  try {
    await AllTotalStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? null
}

type FetchLenderStats = (walletPubkey: string) => Promise<TotalLenderStats | null>
export const fetchLenderStats: FetchLenderStats = async (walletPubkey) => {
  const { data } = await axios.get<{ data: TotalLenderStats }>(
    `${BACKEND_BASE_URL}/stats/lend/${walletPubkey}`,
  )

  try {
    await TotalLenderStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? null
}

type FetchBorrowerStats = (walletPubkey: string) => Promise<TotalBorrowerStats | null>
export const fetchBorrowerStats: FetchBorrowerStats = async (walletPubkey) => {
  const { data } = await axios.get<{ data: TotalBorrowerStats }>(
    `${BACKEND_BASE_URL}/stats/borrow/${walletPubkey}`,
  )

  try {
    await TotalBorrowerStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? null
}
