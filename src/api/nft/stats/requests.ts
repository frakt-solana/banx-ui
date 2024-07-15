import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { validateResponse } from '@banx/api/shared'
import { BACKEND_BASE_URL } from '@banx/constants'

import { convertToMarketType } from '../helpers'
import {
  AllTotalStatsSchema,
  TotalBorrowerStatsSchema,
  TotalLenderStatsSchema,
  UserLoansStatsSchema,
  UserOffersStatsSchema,
} from './schemas'
import {
  AllTotalStats,
  TotalBorrowerStats,
  TotalLenderStats,
  UserLoansStats,
  UserLoansStatsResponse,
  UserOffersStats,
  UserOffersStatsResponse,
} from './types'

type FetchUserOffersStats = (props: {
  walletPubkey: string
  tokenType: LendingTokenType
}) => Promise<UserOffersStats | null>

export const fetchUserOffersStats: FetchUserOffersStats = async ({ walletPubkey, tokenType }) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<UserOffersStatsResponse>(
    `${BACKEND_BASE_URL}/stats/my-offers/${walletPubkey}?${queryParams.toString()}`,
  )

  await validateResponse(data.data, UserOffersStatsSchema)

  return data.data ?? null
}

type FetchUserLoansStats = (props: {
  walletPubkey: string
  tokenType: LendingTokenType
}) => Promise<UserLoansStats | null>

export const fetchUserLoansStats: FetchUserLoansStats = async ({ walletPubkey, tokenType }) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<UserLoansStatsResponse>(
    `${BACKEND_BASE_URL}/stats/my-loans/${walletPubkey}?${queryParams.toString()}`,
  )

  await validateResponse(data.data, UserLoansStatsSchema)

  return data.data ?? null
}

type FetchAllTotalStats = (marketType: 'allInSol' | 'allInUsdc') => Promise<AllTotalStats | null>
export const fetchAllTotalStats: FetchAllTotalStats = async (marketType) => {
  const { data } = await axios.get<{ data: AllTotalStats }>(
    `${BACKEND_BASE_URL}/stats/all?marketType=${marketType}`,
  )

  await validateResponse(data.data, AllTotalStatsSchema)

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

  await validateResponse(data.data, TotalLenderStatsSchema)

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

  await validateResponse(data.data, TotalBorrowerStatsSchema)

  return data.data ?? null
}
