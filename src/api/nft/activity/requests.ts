import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { validateResponse } from '@banx/api/shared'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../helpers'
import {
  ActivityCollectionsList,
  ActivityCollectionsListSchema,
  BorrowedActivityResponse,
  BorrowerActivitySchema,
  FetchActivityCollectionsList,
  FetchBorrowerActivity,
  FetchLenderActivity,
  LenderActivityResponse,
  LenderActivitySchema,
} from './types'

export const fetchLenderActivity: FetchLenderActivity = async ({
  walletPubkey,
  tokenType,
  order,
  state = 'all',
  sortBy,
  skip = 0,
  limit = 10,
  collection,
  getAll = false,
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    sortBy,
    state,
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  if (collection?.length) queryParams.append('collection', String(collection))

  const { data } = await axios.get<LenderActivityResponse>(
    `${BACKEND_BASE_URL}/activity/lender/${walletPubkey}?${queryParams.toString()}`,
  )

  await validateResponse(data.data, LenderActivitySchema.array())

  return data.data ?? []
}

export const fetchBorrowerActivity: FetchBorrowerActivity = async ({
  walletPubkey,
  tokenType,
  order,
  sortBy,
  state = 'all',
  skip = 0,
  limit = 10,
  getAll = false,
  collection,
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    sortBy,
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    state,
  })

  if (collection?.length) queryParams.append('collection', String(collection))

  const { data } = await axios.get<BorrowedActivityResponse>(
    `${BACKEND_BASE_URL}/activity/borrower/${walletPubkey}?${queryParams.toString()}`,
  )

  await validateResponse(data.data, BorrowerActivitySchema.array())

  return data.data ?? []
}

export const fetchActivityCollectionsList: FetchActivityCollectionsList = async ({
  walletPubkey,
  tokenType,
  userType,
}) => {
  const queryParams = new URLSearchParams({
    userType: String(userType),
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<{ data: { collections: ActivityCollectionsList[] } }>(
    `${BACKEND_BASE_URL}/activity/collections-list/${walletPubkey}?${queryParams.toString()}`,
  )

  await validateResponse(data.data.collections, ActivityCollectionsListSchema.array())

  return data.data.collections ?? []
}

export const fetchBorrowBonkRewardsAvailability = async () => {
  const { data } = await axios.get<{
    data: {
      rewardsAvailable: boolean
    }
  }>(`${BACKEND_BASE_URL}/bonds/bonk-rewards-availability`)

  return data?.data?.rewardsAvailable || false
}

export const fetchLenderActivityCSV = async ({
  walletPubkey,
  tokenType,
}: {
  walletPubkey: string
  tokenType: LendingTokenType
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<string>(
    `${BACKEND_BASE_URL}/activity/lender/${walletPubkey}/csv?${queryParams.toString()}`,
  )

  return data ?? ''
}

export const fetchBorrowerActivityCSV = async ({
  walletPubkey,
  tokenType,
}: {
  walletPubkey: string
  tokenType: LendingTokenType
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<string>(
    `${BACKEND_BASE_URL}/activity/borrower/${walletPubkey}/csv?${queryParams.toString()}`,
  )

  return data ?? ''
}
