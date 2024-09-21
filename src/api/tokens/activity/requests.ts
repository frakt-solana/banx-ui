import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { RequestWithPagination, ResponseWithPagination, parseResponseSafe } from '@banx/api/shared'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../../helpers'
import {
  LenderTokenActivitySchema,
  TokenActivityCollectionsListSchema,
  TokenBorrowerActivitySchema,
} from './schemas'
import { LenderTokenActivity, TokenActivityCollectionsList, TokenBorrowerActivity } from './types'

type FetchLenderTokenActivity = (
  props: RequestWithPagination<{
    walletPubkey: string
    tokenType: LendingTokenType
    collection?: string[]
    sortBy: string
    state?: string
  }>,
) => Promise<LenderTokenActivity[]>

export const fetchLenderTokenActivity: FetchLenderTokenActivity = async ({
  walletPubkey,
  tokenType,
  order = 'desc',
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

  const { data } = await axios.get<ResponseWithPagination<LenderTokenActivity>>(
    `${BACKEND_BASE_URL}/spl-activity/lender/${walletPubkey}?${queryParams.toString()}`,
  )

  return LenderTokenActivitySchema.array().parseAsync(data.data)
}

type FetchBorrowerTokenActivity = (
  props: RequestWithPagination<{
    walletPubkey: string
    tokenType: LendingTokenType
    collection?: string[]
    sortBy: string
    state?: string
  }>,
) => Promise<TokenBorrowerActivity[]>
export const fetchBorrowerTokenActivity: FetchBorrowerTokenActivity = async ({
  walletPubkey,
  tokenType,
  order = 'desc',
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

  const { data } = await axios.get<ResponseWithPagination<TokenBorrowerActivity[]>>(
    `${BACKEND_BASE_URL}/spl-activity/borrower/${walletPubkey}?${queryParams.toString()}`,
  )

  return TokenBorrowerActivitySchema.array().parseAsync(data.data)
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

type FetcTokenActivityCollectionsList = (props: {
  walletPubkey: string
  tokenType: LendingTokenType
  userType: 'borrower' | 'lender'
}) => Promise<TokenActivityCollectionsList[]>

export const fetchTokenActivityCollectionsList: FetcTokenActivityCollectionsList = async ({
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

  await parseResponseSafe(data.data.collections, TokenActivityCollectionsListSchema.array())

  return data.data.collections ?? []
}
