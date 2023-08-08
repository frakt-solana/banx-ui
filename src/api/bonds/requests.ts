import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import {
  Market,
  MarketPreview,
  MarketPreviewResponse,
  MarketPreviewSchema,
  MarketSchema,
  Pair,
} from './types'

type FetchMarketsPreview = () => Promise<MarketPreview[]>
export const fetchMarketsPreview: FetchMarketsPreview = async () => {
  try {
    const queryParams = new URLSearchParams({
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

    const { data } = await axios.get<MarketPreviewResponse>(
      `${BACKEND_BASE_URL}/bonds/preview?${queryParams.toString()}`,
    )

    try {
      await MarketPreviewSchema.array().parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return []
  }
}

type FetchAllMarkets = () => Promise<Market[]>
export const fetchAllMarkets: FetchAllMarkets = async () => {
  try {
    const queryParams = new URLSearchParams({
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

    const { data } = await axios.get<Market[]>(
      `${BACKEND_BASE_URL}/markets?${queryParams.toString()}`,
    )

    try {
      await MarketSchema.array().parseAsync(data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data
  } catch (error) {
    console.error(error)
    return []
  }
}

type FetchMarketPairs = (props: { marketPubkey?: web3.PublicKey }) => Promise<Pair[]>
export const fetchMarketPairs: FetchMarketPairs = async ({ marketPubkey }) => {
  try {
    const queryParams = new URLSearchParams({
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

    const { data } = await axios.get<Pair[]>(
      `${BACKEND_BASE_URL}/bond-offers?${marketPubkey?.toBase58() || ''}${queryParams.toString()}`,
    )

    try {
      await MarketSchema.array().parseAsync(data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data
  } catch (error) {
    console.error(error)
    return []
  }
}
