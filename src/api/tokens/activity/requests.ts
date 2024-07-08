import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../../helpers'
import {
  BorrowedTokenActivityResponse,
  FetchBorrowerTokenActivity,
  FetchLenderTokenActivity,
  FetchTokenActivityCollectionsList,
  LenderTokenActivityResponse,
  LenderTokenActivitySchema,
  TokenActivityCollectionsList,
  TokenActivityCollectionsListSchema,
  TokenBorrowerActivitySchema,
} from './types'

export const fetchLenderTokenActivity: FetchLenderTokenActivity = async ({
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

  const { data } = await axios.get<LenderTokenActivityResponse>(
    `${BACKEND_BASE_URL}/spl-activity/lender/${walletPubkey}?${queryParams.toString()}`,
  )

  try {
    await LenderTokenActivitySchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? []
}

export const fetchBorrowerTokenActivity: FetchBorrowerTokenActivity = async ({
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

  const { data } = await axios.get<BorrowedTokenActivityResponse>(
    `${BACKEND_BASE_URL}/spl-activity/borrower/${walletPubkey}?${queryParams.toString()}`,
  )

  try {
    await TokenBorrowerActivitySchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? []
}

export const fetchBorrowerTokenActivityCSV = async ({
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
    `${BACKEND_BASE_URL}/spl-activity/borrower/${walletPubkey}/csv?${queryParams.toString()}`,
  )

  return data ?? ''
}

export const fetchLenderTokenActivityCSV = async ({
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
    `${BACKEND_BASE_URL}/spl-activity/lender/${walletPubkey}/csv?${queryParams.toString()}`,
  )

  return data ?? ''
}

export const fetchTokenActivityCollectionsList: FetchTokenActivityCollectionsList = async ({
  walletPubkey,
  tokenType,
  userType,
}) => {
  const queryParams = new URLSearchParams({
    userType: String(userType),
    marketType: String(convertToMarketType(tokenType)),
    isSpl: String(true),
  })

  const { data } = await axios.get<{ data: { collections: TokenActivityCollectionsList[] } }>(
    `${BACKEND_BASE_URL}/activity/collections-list/${walletPubkey}?${queryParams.toString()}`,
  )

  try {
    await TokenActivityCollectionsListSchema.array().parseAsync(data.data.collections)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data.collections ?? []
}
