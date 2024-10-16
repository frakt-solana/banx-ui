import axios from 'axios'
import {
  BondOfferV3,
  BondingCurveType,
  LendingTokenType,
} from 'fbonds-core/lib/fbond-protocol/types'

import { RequestWithPagination } from '@banx/api/shared'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../../helpers'
import { parseResponseSafe } from './../../shared/validation'
import {
  BondOfferV3Schema,
  BorrowOfferSchema,
  CollateralTokenSchema,
  TokenLoanAuctionsAndListingsSchema,
  TokenLoanSchema,
  TokenMarketPreviewSchema,
  TokenOfferPreviewSchema,
  WalletTokenLoansAndOffersShema,
} from './schemas'
import {
  BorrowOffer,
  CollateralToken,
  TokenLoan,
  TokenLoanAuctionsAndListings,
  TokenLoanAuctionsAndListingsResponse,
  TokenMarketPreview,
  TokenMarketPreviewResponse,
  TokenOfferPreview,
  WalletTokenLoansAndOffers,
} from './types'

type FetchTokenMarketsPreview = (
  props: RequestWithPagination<{ tokenType: LendingTokenType }>,
) => Promise<TokenMarketPreview[]>
export const fetchTokenMarketsPreview: FetchTokenMarketsPreview = async ({ tokenType }) => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    isPrivate: String(IS_PRIVATE_MARKETS),
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<TokenMarketPreviewResponse>(
    `${BACKEND_BASE_URL}/bonds/spl/preview?${queryParams.toString()}`,
  )

  return await TokenMarketPreviewSchema.array().parseAsync(data.data)
}

type FetchTokenMarketOffers = (props: {
  marketPubkey?: string
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<BondOfferV3[] | undefined>
export const fetchTokenMarketOffers: FetchTokenMarketOffers = async ({
  marketPubkey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<{ data: BondOfferV3[] }>(
    `${BACKEND_BASE_URL}/bond-offers/${marketPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<BondOfferV3[]>(data?.data, BondOfferV3Schema.array())
}

type FetchTokenOffersPreview = (props: {
  walletPubkey: string
  tokenType: LendingTokenType
}) => Promise<TokenOfferPreview[] | undefined>
export const fetchTokenOffersPreview: FetchTokenOffersPreview = async ({
  walletPubkey,
  tokenType,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    isPrivate: String(IS_PRIVATE_MARKETS),
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<{ data: TokenOfferPreview[] }>(
    `${BACKEND_BASE_URL}/spl-offers/my-offers/${walletPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenOfferPreview[]>(data?.data, TokenOfferPreviewSchema.array())
}

type FetchWalletTokenLoansAndOffers = (props: {
  walletPublicKey: string
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<WalletTokenLoansAndOffers | undefined>

export const fetchWalletTokenLoansAndOffers: FetchWalletTokenLoansAndOffers = async ({
  walletPublicKey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    getAll: String(getAll),
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<{ data: WalletTokenLoansAndOffers }>(
    `${BACKEND_BASE_URL}/spl-loans/borrower/${walletPublicKey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<WalletTokenLoansAndOffers>(
    data?.data,
    WalletTokenLoansAndOffersShema,
  )
}

type FetchTokenLenderLoans = (props: {
  walletPublicKey: string
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoan[] | undefined>
export const fetchTokenLenderLoans: FetchTokenLenderLoans = async ({
  walletPublicKey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  const { data } = await axios.get<{ data: TokenLoan[] }>(
    `${BACKEND_BASE_URL}/spl-loans/lender/${walletPublicKey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoan[]>(data.data, TokenLoanSchema.array())
}

type FetchBorrowOffers = (props: {
  market: string
  bondingCurveType: BondingCurveType
  ltvLimit: number | undefined //? base points
  excludeWallet?: string
}) => Promise<BorrowOffer[] | undefined>
export const fetchBorrowOffers: FetchBorrowOffers = async (props) => {
  const { market, bondingCurveType, ltvLimit, excludeWallet } = props

  const queryParams = new URLSearchParams({
    market: String(market),
    bondingCurveType: String(bondingCurveType),
    excludeWallet: String(excludeWallet),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })
  if (ltvLimit) {
    queryParams.append('ltvLimit', String(ltvLimit))
  }

  const { data } = await axios.get<{ data: BorrowOffer[] }>(
    `${BACKEND_BASE_URL}/lending/spl/borrow-token-v5?${queryParams?.toString()}`,
  )

  return await parseResponseSafe<BorrowOffer[]>(data?.data, BorrowOfferSchema.array())
}

type fetchTokenLoanAuctionsAndListings = (props: {
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoanAuctionsAndListings | undefined>

export const fetchTokenLoanAuctionsAndListings: fetchTokenLoanAuctionsAndListings = async ({
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  const { data } = await axios.get<TokenLoanAuctionsAndListingsResponse>(
    `${BACKEND_BASE_URL}/spl-loans/requests?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoanAuctionsAndListings>(
    data.data,
    TokenLoanAuctionsAndListingsSchema,
  )
}

type FetchUserTokenLoanListings = (props: {
  walletPubkey: string
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoan[] | undefined>

export const fetchUserTokenLoanListings: FetchUserTokenLoanListings = async ({
  walletPubkey,
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  const { data } = await axios.get<{ data: TokenLoan[] }>(
    `${BACKEND_BASE_URL}/spl-loans/borrower-requests/${walletPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenLoan[]>(data.data, TokenLoanSchema.array())
}

export const fetchCollateralsList = async (props: {
  walletPubkey?: string
  marketType: LendingTokenType
}) => {
  const { walletPubkey, marketType } = props

  const queryParams = new URLSearchParams({
    isPrivate: String(IS_PRIVATE_MARKETS),
    marketType: String(convertToMarketType(marketType)),
  })

  const { data } = await axios.get<{ data: CollateralToken[] }>(
    `${BACKEND_BASE_URL}/spl-assets/${walletPubkey}?${queryParams?.toString()}`,
  )

  return await parseResponseSafe<CollateralToken[]>(data.data, CollateralTokenSchema.array())
}
