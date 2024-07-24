import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { RequestWithPagination } from '@banx/api/shared'
import { IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../helpers'
import {
  BorrowNftsAndOffersSchema,
  LenderLoansSchema,
  LoanSchema,
  LoansRequestsSchema,
  MarketPreviewSchema,
  OfferSchema,
  UserOfferSchema,
  WalletLoansAndOffersShema,
} from './schemas'
import {
  AllLoansRequestsResponse,
  BorrowNftsAndOffers,
  BorrowNftsAndOffersResponse,
  FetchMarketOffersResponse,
  FetchUserOffersResponse,
  LendLoansResponse,
  LenderLoansResponse,
  Loan,
  LoansRequests,
  MarketPreview,
  MarketPreviewResponse,
  Offer,
  UserOffer,
  WalletLoansAndOffers,
  WalletLoansAndOffersResponse,
} from './types'

const TEST_BE_BASE = 'http://ec2-34-226-191-201.compute-1.amazonaws.com:3000'

type FetchMarketsPreview = (
  props: RequestWithPagination<{ tokenType: LendingTokenType }>,
) => Promise<MarketPreview[]>
export const fetchMarketsPreview: FetchMarketsPreview = async ({ tokenType, getAll = true }) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<MarketPreviewResponse>(
    `${TEST_BE_BASE}/bonds/preview?${queryParams.toString()}`,
  )

  return await MarketPreviewSchema.array().parseAsync(data.data)
}

type FetchMarketOffers = (
  props: RequestWithPagination<{
    marketPubkey?: string
    tokenType: LendingTokenType
  }>,
) => Promise<Offer[]>
export const fetchMarketOffers: FetchMarketOffers = async ({
  marketPubkey,
  tokenType,
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
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<FetchMarketOffersResponse>(
    `${TEST_BE_BASE}/bond-offers/${marketPubkey}?${queryParams.toString()}`,
  )

  return await OfferSchema.array().parseAsync(data?.data)
}

type FetchWalletLoansAndOffers = (
  props: RequestWithPagination<{
    walletPublicKey: string
    tokenType: LendingTokenType
  }>,
) => Promise<WalletLoansAndOffers>

export const fetchWalletLoansAndOffers: FetchWalletLoansAndOffers = async ({
  walletPublicKey,
  tokenType,
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
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<WalletLoansAndOffersResponse>(
    `${TEST_BE_BASE}/loans/borrower/${walletPublicKey}?${queryParams.toString()}`,
  )

  return WalletLoansAndOffersShema.parseAsync(data.data)
}

type FetchLenderLoansByCertainOffer = (
  props: RequestWithPagination<{
    walletPublicKey: string
    tokenType: LendingTokenType
    offerPubkey: string
  }>,
) => Promise<LenderLoansResponse['data']>

export const fetchLenderLoansByCertainOffer: FetchLenderLoansByCertainOffer = async ({
  walletPublicKey,
  tokenType,
  offerPubkey,
  order = 'desc',
  skip = 0,
  limit = 10,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    order,
    skip: String(skip),
    limit: String(limit),
    getAll: String(getAll),
    isPrivate: String(IS_PRIVATE_MARKETS),
    walletPubKey: String(walletPublicKey),
    marketType: String(convertToMarketType(tokenType)),
    offerPubKey: String(offerPubkey),
  })

  const { data } = await axios.get<LenderLoansResponse>(
    `${TEST_BE_BASE}/loans/lender-chart/?${queryParams.toString()}`,
  )

  return LenderLoansSchema.array().parseAsync(data.data)
}

type FetchLenderLoans = (
  props: RequestWithPagination<{
    walletPublicKey: string
    tokenType: LendingTokenType
    sortBy?: 'status' | 'apr'
  }>,
) => Promise<LendLoansResponse['data']>
export const fetchLenderLoans: FetchLenderLoans = async ({
  walletPublicKey,
  tokenType,
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
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<LendLoansResponse>(
    `${TEST_BE_BASE}/loans/lender/${walletPublicKey}?${queryParams.toString()}`,
  )

  return LoanSchema.array().parseAsync(data.data)
}

type FetchBorrowNftsAndOffers = (
  props: RequestWithPagination<{
    walletPubkey: string
    tokenType: LendingTokenType
  }>,
) => Promise<BorrowNftsAndOffers>
export const fetchBorrowNftsAndOffers: FetchBorrowNftsAndOffers = async ({
  walletPubkey,
  tokenType,
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
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<BorrowNftsAndOffersResponse>(
    `${TEST_BE_BASE}/nfts/borrow/${walletPubkey}?${queryParams.toString()}`,
  )

  return BorrowNftsAndOffersSchema.parseAsync(data.data)
}

type FetchBorrowerLoansRequests = (
  props: RequestWithPagination<{
    walletPublicKey: string
    tokenType: LendingTokenType
  }>,
) => Promise<Loan[]>
export const fetchBorrowerLoansRequests: FetchBorrowerLoansRequests = async ({
  walletPublicKey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  const { data } = await axios.get<{ data: Loan[] }>(
    `${TEST_BE_BASE}/loans/borrower-requests/${walletPublicKey}?${queryParams.toString()}`,
  )

  return LoanSchema.array().parseAsync(data.data)
}

type FetchAllLoansRequests = (
  props: RequestWithPagination<{
    tokenType: LendingTokenType
  }>,
) => Promise<LoansRequests>
export const fetchAllLoansRequests: FetchAllLoansRequests = async ({
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  const { data } = await axios.get<AllLoansRequestsResponse>(
    `${TEST_BE_BASE}/loans/requests?${queryParams.toString()}`,
  )

  return LoansRequestsSchema.parseAsync(data.data)
}

type FetchUserOffers = (
  props: RequestWithPagination<{
    walletPubkey: string
    tokenType: LendingTokenType
  }>,
) => Promise<UserOffer[]>
export const fetchUserOffers: FetchUserOffers = async ({
  walletPubkey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<FetchUserOffersResponse>(
    `${TEST_BE_BASE}/bond-offers/user/${walletPubkey}?${queryParams.toString()}`,
  )

  return UserOfferSchema.array().parseAsync(data.data)
}
