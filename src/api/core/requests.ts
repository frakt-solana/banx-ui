import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import {
  AuctionsLoansResponse,
  BorrowNftsAndOffers,
  BorrowNftsAndOffersResponse,
  BorrowNftsAndOffersSchema,
  FetchMarketOffersResponse,
  FetchUserOffersResponse,
  LendLoansAndOffersResponse,
  LendLoansAndOffersSchema,
  LenderLoansResponse,
  LenderLoansSchema,
  LoanSchema,
  MarketPreview,
  MarketPreviewResponse,
  MarketPreviewSchema,
  Offer,
  PairSchema,
  UserOffer,
  UserOfferSchema,
  WalletLoansAndOffers,
  WalletLoansAndOffersResponse,
  WalletLoansAndOffersShema,
} from './types'

type FetchMarketsPreview = () => Promise<MarketPreview[]>
export const fetchMarketsPreview: FetchMarketsPreview = async () => {
  try {
    const queryParams = new URLSearchParams({
      isPrivate: String(IS_PRIVATE_MARKETS),
      getAll: String(true),
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

type FetchMarketOffers = (props: {
  marketPubkey?: web3.PublicKey | null
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<Offer[]>
export const fetchMarketOffers: FetchMarketOffers = async ({
  marketPubkey,
  order = 'desc',
  skip = 0,
  limit = 10,
  getAll = true, //TODO Remove when normal pagination added
}) => {
  try {
    const queryParams = new URLSearchParams({
      order,
      skip: String(skip),
      limit: String(limit),
      getAll: String(getAll),
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

    const { data } = await axios.get<FetchMarketOffersResponse>(
      `${BACKEND_BASE_URL}/bond-offers/${marketPubkey?.toBase58() || ''}?${queryParams.toString()}`,
    )

    try {
      await PairSchema.array().parseAsync(data?.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data?.data
  } catch (error) {
    console.error(error)
    return []
  }
}

type FetchWalletLoansAndOffers = (props: {
  walletPublicKey: string
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<WalletLoansAndOffers>

export const fetchWalletLoansAndOffers: FetchWalletLoansAndOffers = async ({
  walletPublicKey,
  order = 'desc',
  skip = 0,
  limit = 10,
  getAll = true, //TODO Remove when normal pagination added
}) => {
  try {
    const queryParams = new URLSearchParams({
      order,
      skip: String(skip),
      limit: String(limit),
      getAll: String(getAll),
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

    const { data } = await axios.get<WalletLoansAndOffersResponse>(
      `${BACKEND_BASE_URL}/loans/v2/${walletPublicKey}?${queryParams.toString()}`,
    )

    try {
      await WalletLoansAndOffersShema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data || { nfts: [], offers: {} }
  } catch (error) {
    console.error(error)
    return { nfts: [], offers: {} }
  }
}

type fetchLenderLoansAndOffers = (props: {
  walletPublicKey: string
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<LendLoansAndOffersResponse['data']>

export const fetchLenderLoansAndOffers: fetchLenderLoansAndOffers = async ({
  walletPublicKey,
  order = 'desc',
  skip = 0,
  limit = 10,
  getAll = true, //TODO Remove when normal pagination added
}) => {
  try {
    const queryParams = new URLSearchParams({
      order,
      skip: String(skip),
      limit: String(limit),
      getAll: String(getAll),
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

    const { data } = await axios.get<LendLoansAndOffersResponse>(
      `${BACKEND_BASE_URL}/loans/lender/v2/${walletPublicKey}?${queryParams.toString()}`,
    )

    try {
      await LendLoansAndOffersSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data ?? []
  } catch (error) {
    console.error(error)
    return []
  }
}

type FetchLenderLoansByCertainOffer = (props: {
  walletPublicKey: string
  offerPubkey: string
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<LenderLoansResponse['data']>

export const fetchLenderLoansByCertainOffer: FetchLenderLoansByCertainOffer = async ({
  walletPublicKey,
  offerPubkey,
  order = 'desc',
  skip = 0,
  limit = 10,
  getAll = true, //TODO Remove when normal pagination added
}) => {
  try {
    const queryParams = new URLSearchParams({
      order,
      skip: String(skip),
      limit: String(limit),
      getAll: String(getAll),
      isPrivate: String(IS_PRIVATE_MARKETS),
      walletPubKey: String(walletPublicKey),
      offerPubKey: String(offerPubkey),
    })

    const { data } = await axios.get<LenderLoansResponse>(
      `${BACKEND_BASE_URL}/loans/lender/v3/?${queryParams.toString()}`,
    )

    try {
      await LenderLoansSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data ?? []
  } catch (error) {
    console.error(error)
    return []
  }
}

type FetchBorrowNftsAndOffers = (props: {
  walletPubkey: string
  order?: string
  getAll?: boolean
  skip?: number
  limit?: number
}) => Promise<BorrowNftsAndOffers>
export const fetchBorrowNftsAndOffers: FetchBorrowNftsAndOffers = async ({
  walletPubkey,
  getAll = true, //TODO Remove when normal pagination added
  order = 'desc',
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

    const { data } = await axios.get<BorrowNftsAndOffersResponse>(
      `${BACKEND_BASE_URL}/nfts/borrow/${walletPubkey}?${queryParams.toString()}`,
    )

    //TODO: Remove it when BE satisfyies schema
    try {
      await BorrowNftsAndOffersSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data || { nfts: [], offers: {} }
  } catch (error) {
    console.error(error)
    return { nfts: [], offers: {} }
  }
}

export const fetchAuctionsLoans = async () => {
  try {
    const queryParams = new URLSearchParams({
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

    const { data } = await axios.get<AuctionsLoansResponse>(
      `${BACKEND_BASE_URL}/auctions/?${queryParams.toString()}`,
    )

    try {
      await LoanSchema.array().parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data
  } catch (error) {
    console.error(error)
    return []
  }
}

type FetchUserOffers = (props: { walletPubkey: string; getAll?: boolean }) => Promise<UserOffer[]>
export const fetchUserOffers: FetchUserOffers = async ({ walletPubkey, getAll = true }) => {
  try {
    const queryParams = new URLSearchParams({
      isPrivate: String(IS_PRIVATE_MARKETS),
      getAll: String(getAll),
    })

    const { data } = await axios.get<FetchUserOffersResponse>(
      `${BACKEND_BASE_URL}/bond-offers/user/${walletPubkey}?${queryParams.toString()}`,
    )

    try {
      await UserOfferSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data ?? []
  } catch (error) {
    console.error(error)
    return []
  }
}
