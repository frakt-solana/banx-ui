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
  TokenLoanSchema,
  TokenLoansRequestsSchema,
  TokenMarketPreviewSchema,
  TokenOfferPreviewSchema,
  WalletTokenLoansAndOffersShema,
} from './schemas'
import {
  AllTokenLoansRequestsResponse,
  BorrowOffer,
  CollateralToken,
  TokenLoan,
  TokenLoansRequests,
  TokenMarketPreview,
  TokenMarketPreviewResponse,
  TokenOfferPreview,
  WalletTokenLoansAndOffers,
} from './types'

const DEV_BACKEND_BASE_URL = 'http://ec2-52-87-120-232.compute-1.amazonaws.com:3000'

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
    `${DEV_BACKEND_BASE_URL}/bonds/spl/preview?${queryParams.toString()}`,
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
    `${DEV_BACKEND_BASE_URL}/bond-offers/${marketPubkey}?${queryParams.toString()}`,
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
    `${DEV_BACKEND_BASE_URL}/spl-offers/my-offers/${walletPubkey}?${queryParams.toString()}`,
  )

  return await parseResponseSafe<TokenOfferPreview[]>(data?.data, TokenOfferPreviewSchema.array())
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
    `${DEV_BACKEND_BASE_URL}/spl-loans/borrower/${walletPublicKey}?${queryParams.toString()}`,
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
    `${DEV_BACKEND_BASE_URL}/spl-loans/lender/${walletPublicKey}?${queryParams.toString()}`,
  )

  try {
    await TokenLoanSchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? []
}

type FetchBorrowOffers = (props: {
  market: string
  bondingCurveType: BondingCurveType
  ltvLimit: number //? base points
  collateralsAmount: string
  excludeWallet?: string
  disableMultiBorrow: boolean
}) => Promise<BorrowOffer[] | undefined>
export const fetchBorrowOffers: FetchBorrowOffers = async (props) => {
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

  const { data } = await axios.get<{ data: BorrowOffer[] }>(
    `${BACKEND_BASE_URL}/lending/spl/borrow-token-v4?${queryParams?.toString()}`,
  )

  return await parseResponseSafe<BorrowOffer[]>(data?.data, BorrowOfferSchema.array())
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
    `${DEV_BACKEND_BASE_URL}/spl-loans/requests?${queryParams.toString()}`,
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
    `${DEV_BACKEND_BASE_URL}/spl-assets/${walletPubkey}?${queryParams?.toString()}`,
  )

  try {
    await CollateralTokenSchema.array().parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data
}
