import axios from 'axios'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { BorrowerActivitySchema, LenderActivitySchema } from './schemas'
import {
  BorrowedActivityResponse,
  FetchBorrowerActivity,
  FetchLenderActivity,
  LenderActivityResponse,
} from './types'

export const fetchLenderActivity: FetchLenderActivity = async ({
  walletPubkey,
  getAll = true, //TODO Remove when normal pagination added
  order = 'asc',
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
      getAll: String(getAll),
      sortBy: String(sortBy),
      collection: String(collection),
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

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
  getAll = true, //TODO Remove when normal pagination added
  order = 'asc',
  skip = 0,
  limit = 10,
}) => {
  try {
    const queryParams = new URLSearchParams({
      order,
      skip: String(skip),
      limit: String(limit),
      getAll: String(getAll),
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

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
