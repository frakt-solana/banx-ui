import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { RequestWithPagination, ResponseWithPagination } from '@banx/api/shared'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

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
  BorrowNftsAndOffers,
  LenderLoans,
  Loan,
  LoansRequests,
  MarketPreview,
  Offer,
  UserOffer,
  WalletLoansAndOffers,
} from './types'

type FetchMarketsPreview = (
  props: RequestWithPagination<{ tokenType: LendingTokenType }>,
) => Promise<MarketPreview[]>
export const fetchMarketsPreview: FetchMarketsPreview = async ({ tokenType, getAll = true }) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<ResponseWithPagination<unknown>>(
    `${BACKEND_BASE_URL}/bonds/preview?${queryParams.toString()}`,
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

  const { data } = await axios.get<ResponseWithPagination<unknown>>(
    `${BACKEND_BASE_URL}/bond-offers/${marketPubkey}?${queryParams.toString()}`,
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

  const { data } = await axios.get(
    `${BACKEND_BASE_URL}/loans/borrower/${walletPublicKey}?${queryParams.toString()}`,
  )

  return await WalletLoansAndOffersShema.parseAsync(data.data)
}

type FetchLenderLoansByCertainOffer = (
  props: RequestWithPagination<{
    walletPublicKey: string
    tokenType: LendingTokenType
    offerPubkey: string
  }>,
) => Promise<LenderLoans[]>

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

  const { data } = await axios.get<ResponseWithPagination<unknown>>(
    `${BACKEND_BASE_URL}/loans/lender-chart/?${queryParams.toString()}`,
  )

  return await LenderLoansSchema.array().parseAsync(data.data)
}

type FetchLenderLoans = (
  props: RequestWithPagination<{
    walletPublicKey: string
    tokenType: LendingTokenType
    sortBy?: 'status' | 'apr'
  }>,
) => Promise<Loan[]>
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

  const { data } = await axios.get<ResponseWithPagination<unknown>>(
    `${BACKEND_BASE_URL}/loans/lender/${walletPublicKey}?${queryParams.toString()}`,
  )

  return await LoanSchema.array().parseAsync(data.data)
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

  const { data } = await axios.get<ResponseWithPagination<unknown>>(
    `${BACKEND_BASE_URL}/nfts/borrow/${walletPubkey}?${queryParams.toString()}`,
  )

  return await BorrowNftsAndOffersSchema.parseAsync(data.data)
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

  const { data } = await axios.get<ResponseWithPagination<unknown>>(
    `${BACKEND_BASE_URL}/loans/borrower-requests/${walletPublicKey}?${queryParams.toString()}`,
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

  const { data } = await axios.get<ResponseWithPagination<unknown>>(
    `${BACKEND_BASE_URL}/loans/requests?${queryParams.toString()}`,
  )

  return await LoansRequestsSchema.parseAsync(data.data)
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

  const { data } = await axios.get<ResponseWithPagination<unknown>>(
    `${BACKEND_BASE_URL}/bond-offers/user/${walletPubkey}?${queryParams.toString()}`,
  )

  return await UserOfferSchema.array().parseAsync(data.data)
}
