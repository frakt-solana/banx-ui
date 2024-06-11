import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer, OfferSchema } from '@banx/api/nft'
import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../../helpers'
import {
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

type FetchWalletLoansAndOffers = (props: {
  walletPublicKey: string
  tokenType: LendingTokenType
  getAll?: boolean
}) => Promise<WalletTokenLoansAndOffers>

export const fetchWalletTokenLoansAndOffers: FetchWalletLoansAndOffers = async ({
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
