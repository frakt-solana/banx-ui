import axios from 'axios'
import {
  BondOfferV3,
  BondingCurveType,
  LendingTokenType,
} from 'fbonds-core/lib/fbond-protocol/types'

import { BondOfferV3Schema } from '@banx/api/nft'
import { RequestWithPagination } from '@banx/api/shared'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../../helpers'
import { parseResponseSafe } from './../../shared/validation'
import {
  CollateralTokenSchema,
  TokenLoanSchema,
  TokenLoansRequestsSchema,
  TokenMarketPreviewSchema,
  TokenOfferPreviewSchema,
  WalletTokenLoansAndOffersShema,
} from './schemas'
import {
  AllTokenLoansRequestsResponse,
  CollateralToken,
  TokenLoan,
  TokenLoansRequests,
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

  try {
    await TokenMarketPreviewSchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

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
}) => Promise<TokenOfferPreview[]>
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

  try {
    await TokenOfferPreviewSchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data
}

type FetchWalletTokenLoansAndOffers = (props: {
  walletPublicKey: string
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<WalletTokenLoansAndOffers>

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

  try {
    await WalletTokenLoansAndOffersShema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? { loans: [], offers: {} }
}

type FetchTokenLenderLoans = (props: {
  walletPublicKey: string
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoan[]>
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

  try {
    await TokenLoanSchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? []
}

export interface BorrowSplTokenOffers {
  offerPublicKey: string
  amountToGive: string
  amountToGet: string
}

type FetchBorrowSplTokenOffers = (props: {
  market: string
  bondingCurveType: BondingCurveType
  ltvLimit: number //? base points
  collateralsAmount: number
  excludeWallet?: string
  disableMultiBorrow: boolean
}) => Promise<BorrowSplTokenOffers[]>
export const fetchBorrowSplTokenOffers: FetchBorrowSplTokenOffers = async (props) => {
  const {
    market,
    bondingCurveType,
    ltvLimit,
    collateralsAmount,
    excludeWallet,
    disableMultiBorrow,
  } = props

  const queryParams = new URLSearchParams({
    market: String(market),
    bondingCurveType: String(bondingCurveType),
    ltvLimit: String(ltvLimit),
    collateralsAmount: String(collateralsAmount),
    excludeWallet: String(excludeWallet),
    disableMultiBorrow: String(disableMultiBorrow),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<{ data: BorrowSplTokenOffers[] }>(
    `${BACKEND_BASE_URL}/lending/spl/borrow-token-v2?${queryParams?.toString()}`,
  )

  return data.data ?? []
}

type FetchAllTokenLoansRequests = (props: {
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<TokenLoansRequests>

export const fetchAllTokenLoansRequests: FetchAllTokenLoansRequests = async ({
  tokenType,
  getAll = true,
}) => {
  const queryParams = new URLSearchParams({
    marketType: String(convertToMarketType(tokenType)),
    isPrivate: String(IS_PRIVATE_MARKETS),
    getAll: String(getAll),
  })

  const { data } = await axios.get<AllTokenLoansRequestsResponse>(
    `${BACKEND_BASE_URL}/spl-loans/requests?${queryParams.toString()}`,
  )

  try {
    await TokenLoansRequestsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data
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

  try {
    await CollateralTokenSchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data
}
