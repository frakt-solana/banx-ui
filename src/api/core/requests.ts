import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'
import { TokenType } from '@banx/store'

import {
  AuctionsLoansResponse,
  BorrowNftsAndOffers,
  BorrowNftsAndOffersResponse,
  BorrowNftsAndOffersSchema,
  FetchMarketOffersResponse,
  FetchUserOffersResponse,
  LendLoansResponse,
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

type FetchMarketsPreview = (props: { marketType: TokenType }) => Promise<MarketPreview[]>
export const fetchMarketsPreview: FetchMarketsPreview = async ({ marketType }) => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    marketType: String(marketType),
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
}

type FetchMarketOffers = (props: {
  marketPubkey?: web3.PublicKey | null
  marketType: TokenType
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<Offer[]>
export const fetchMarketOffers: FetchMarketOffers = async ({
  marketPubkey,
  marketType,
  order = 'desc',
  skip = 0,
  limit = 10,
  getAll = true, //TODO Remove when normal pagination added
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    getAll: String(getAll),
    marketType: String(marketType),
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
}

type FetchWalletLoansAndOffers = (props: {
  walletPublicKey: string
  marketType: TokenType
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<WalletLoansAndOffers>

export const fetchWalletLoansAndOffers: FetchWalletLoansAndOffers = async ({
  walletPublicKey,
  marketType,
  order = 'desc',
  skip = 0,
  limit = 10,
  getAll = true, //TODO Remove when normal pagination added
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    getAll: String(getAll),
    marketType: String(marketType),
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

  return data.data ?? { nfts: [], offers: {} }
}

type FetchLenderLoansByCertainOffer = (props: {
  walletPublicKey: string
  marketType: TokenType
  offerPubkey: string
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<LenderLoansResponse['data']>

export const fetchLenderLoansByCertainOffer: FetchLenderLoansByCertainOffer = async ({
  walletPublicKey,
  marketType,
  offerPubkey,
  order = 'desc',
  skip = 0,
  limit = 10,
  getAll = true, //TODO Remove when normal pagination added
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    getAll: String(getAll),
    isPrivate: String(IS_PRIVATE_MARKETS),
    walletPubKey: String(walletPublicKey),
    marketType: String(marketType),
    offerPubKey: String(offerPubkey),
  })

  const { data } = await axios.get<LenderLoansResponse>(
    `${BACKEND_BASE_URL}/loans/lender-loans/v3/?${queryParams.toString()}`,
  )

  try {
    await LenderLoansSchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? []
}

type FetchLenderLoans = (props: {
  walletPublicKey: string
  marketType: TokenType
  sortBy?: 'status' | 'apr'
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<LendLoansResponse['data']>
export const fetchLenderLoans: FetchLenderLoans = async ({
  walletPublicKey,
  marketType,
  order = 'desc',
  skip = 0,
  limit = 50,
  sortBy = 'status',
  getAll = true, //TODO Remove when normal pagination added
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    getAll: String(getAll),
    sortBy: String(sortBy),
    marketType: String(marketType),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<LendLoansResponse>(
    `${BACKEND_BASE_URL}/loans/lender/${walletPublicKey}?${queryParams.toString()}`,
  )

  try {
    await LoanSchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? []
}

type FetchBorrowNftsAndOffers = (props: {
  walletPubkey: string
  marketType: TokenType
  order?: string
  getAll?: boolean
  skip?: number
  limit?: number
}) => Promise<BorrowNftsAndOffers>
export const fetchBorrowNftsAndOffers: FetchBorrowNftsAndOffers = async ({
  walletPubkey,
  marketType,
  getAll = true, //TODO Remove when normal pagination added
  order = 'desc',
  skip = 0,
  limit = 10,
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    getAll: String(getAll),
    marketType: String(marketType),
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

  return data.data ?? { nfts: [], offers: {} }
}

type FetchAuctionsLoans = (props: {
  marketType: TokenType
}) => Promise<AuctionsLoansResponse['data']>

export const fetchAuctionsLoans: FetchAuctionsLoans = async ({ marketType }) => {
  const queryParams = new URLSearchParams({
    marketType: String(marketType),
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

  return data.data ?? []
}

type FetchUserOffers = (props: {
  walletPubkey: string
  marketType: TokenType
  getAll?: boolean
}) => Promise<UserOffer[]>

export const fetchUserOffers: FetchUserOffers = async ({
  walletPubkey,
  marketType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    marketType: String(marketType),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<FetchUserOffersResponse>(
    `${BACKEND_BASE_URL}/bond-offers/user/${walletPubkey}?${queryParams.toString()}`,
  )

  try {
    await UserOfferSchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? []
}
