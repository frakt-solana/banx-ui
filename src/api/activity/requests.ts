import axios from 'axios'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

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
  order = 'asc',
  state = 'all',
  sortBy,
  skip = 0,
  limit = 10,
  collection,
}) => {
  try {
    const queryParams = new URLSearchParams({
      order,
      skip: String(skip),
      limit: String(limit),
      sortBy,
      state,
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

    if (collection?.length) queryParams.append('collection', String(collection))

    const { data } = await axios.get<LenderActivityResponse>(
      `${BACKEND_BASE_URL}/activity/lender/${walletPubkey}?${queryParams.toString()}`,
    )

    try {
      await LenderActivitySchema.array().parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return []
  }
}

export const fetchBorrowerActivity: FetchBorrowerActivity = async ({
  walletPubkey,
  order = 'asc',
  sortBy,
  state = 'all',
  skip = 0,
  limit = 10,
  collection,
}) => {
  try {
    const queryParams = new URLSearchParams({
      order,
      skip: String(skip),
      limit: String(limit),
      sortBy,
      isPrivate: String(IS_PRIVATE_MARKETS),
      state,
    })

    if (collection?.length) queryParams.append('collection', String(collection))

    const { data } = await axios.get<BorrowedActivityResponse>(
      `${BACKEND_BASE_URL}/activity/borrower/${walletPubkey}?${queryParams.toString()}`,
    )

    try {
      await BorrowerActivitySchema.array().parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return []
  }
}

export const fetchActivityCollectionsList: FetchActivityCollectionsList = async ({
  walletPubkey,
  userType,
}) => {
  try {
    const queryParams = new URLSearchParams({
      userType: String(userType),
    })

    const { data } = await axios.get<{ data: { collections: ActivityCollectionsList[] } }>(
      `${BACKEND_BASE_URL}/activity/collections-list/${walletPubkey}?${queryParams.toString()}`,
    )

    try {
      await ActivityCollectionsListSchema.array().parseAsync(data.data.collections)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data.collections
  } catch (error) {
    console.error(error)
    return []
  }
}
