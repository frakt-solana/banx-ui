import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { BACKEND_BASE_URL } from '@banx/constants'

import { convertToMarketType } from '../../helpers'
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

type FetchUserOffersStats = (props: {
  walletPubkey: string
  marketType: LendingTokenType
  tokenType: 'nft' | 'spl'
}) => Promise<UserOffersStats | null>

//TODO (TokenLending): Move to common folder
export const fetchUserOffersStats: FetchUserOffersStats = async ({
  walletPubkey,
  marketType,
  tokenType,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(marketType)),
    tokenType: String(tokenType),
  })

  const { data } = await axios.get<UserOffersStatsResponse>(
    `${BACKEND_BASE_URL}/stats/my-offers/${walletPubkey}?${queryParams.toString()}`,
  )

  try {
    await UserOffersStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? null
}

type FetchUserLoansStats = (props: {
  walletPubkey: string
  marketType: LendingTokenType
  tokenType: 'nft' | 'spl'
}) => Promise<UserLoansStats | null>

export const fetchUserLoansStats: FetchUserLoansStats = async ({
  walletPubkey,
  marketType,
  tokenType,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(marketType)),
    tokenType: String(tokenType),
  })

  const { data } = await axios.get<UserLoansStatsResponse>(
    `${BACKEND_BASE_URL}/stats/my-loans/${walletPubkey}?${queryParams.toString()}`,
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
    `${BACKEND_BASE_URL}/stats/all?marketType=${marketType}`,
  )

  try {
    await AllTotalStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? null
}

type FetchLenderStats = (props: {
  walletPubkey: string
  tokenType: LendingTokenType
}) => Promise<TotalLenderStats | null>
export const fetchLenderStats: FetchLenderStats = async ({ walletPubkey, tokenType }) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<{ data: TotalLenderStats }>(
    `${BACKEND_BASE_URL}/stats/lend/${walletPubkey}?${queryParams.toString()}`,
  )

  try {
    await TotalLenderStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? null
}

type FetchBorrowerStats = (props: {
  walletPubkey: string
  tokenType: LendingTokenType
}) => Promise<TotalBorrowerStats | null>
export const fetchBorrowerStats: FetchBorrowerStats = async ({ walletPubkey, tokenType }) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<{ data: TotalBorrowerStats }>(
    `${BACKEND_BASE_URL}/stats/borrow/${walletPubkey}?${queryParams.toString()}`,
  )

  try {
    await TotalBorrowerStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? null
}
