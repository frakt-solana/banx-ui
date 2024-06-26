import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer, OfferSchema } from '@banx/api/nft'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../../helpers'
import {
  TokenLoan,
  TokenLoanSchema,
  TokenMarketPreview,
  TokenMarketPreviewResponse,
  TokenMarketPreviewSchema,
  TokenOfferPreview,
  TokenOfferPreviewSchema,
  WalletTokenLoansAndOffers,
  WalletTokenLoansAndOffersShema,
} from './types'

type FetchTokenMarketsPreview = (props: {
  tokenType: LendingTokenType
}) => Promise<TokenMarketPreview[]>
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

  return data.data
}

type FetchTokenMarketOffers = (props: {
  marketPubkey?: string
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<Offer[]>
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

  const { data } = await axios.get<{ data: Offer[] }>(
    `${BACKEND_BASE_URL}/bond-offers/${marketPubkey}?${queryParams.toString()}`,
  )

  try {
    await OfferSchema.array().parseAsync(data?.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data?.data
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
    `${BACKEND_BASE_URL}/my-offers/${walletPubkey}?${queryParams.toString()}`,
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
  sortBy?: 'status' | 'apr'
  order?: 'asc' | 'desc'
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<TokenLoan[]>
export const fetchTokenLenderLoans: FetchTokenLenderLoans = async ({
  walletPublicKey,
  tokenType,
  order = 'desc',
  skip = 0,
  limit = 50,
  sortBy = 'status',
  getAll = true,
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

export enum OutputToken {
  SOL = 'SOL',
  USDC = 'USDC',
  BanxSOL = 'BanxSOL',
}

export interface BorrowSplTokenOffers {
  offerPublicKey: string
  amountToGive: string
  amountToGet: string
}

type FetchBorrowSplTokenOffers = (props: {
  market: string
  outputToken: string
  type: 'input' | 'output'
  amount: string //? hex number string
}) => Promise<BorrowSplTokenOffers[]>
export const fetchBorrowSplTokenOffers: FetchBorrowSplTokenOffers = async (props) => {
  const { market, outputToken, type, amount } = props

  const queryParams = new URLSearchParams({
    isPrivate: String(IS_PRIVATE_MARKETS),
    type: String(type),
    amount: String(amount),
    market: String(market),
    outputToken: String(outputToken),
  })

  const { data } = await axios.get<{ data: BorrowSplTokenOffers[] }>(
    `${BACKEND_BASE_URL}/lending/spl/borrow-token?${queryParams?.toString()}`,
  )

  return data.data ?? []
}
