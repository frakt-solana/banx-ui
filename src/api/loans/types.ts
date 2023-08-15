import { z } from 'zod'

import { PAGINATION_META } from '@banx/types'

export interface WalletLoansResponse {
  data: Loan[]
  meta: PAGINATION_META
}

const NFTSchema = z.object({
  mint: z.string(),
  meta: z.object({
    collectionSlug: z.string(),
    imageUrl: z.string(),
    name: z.string(),
    collectionName: z.string(),
    collectionImage: z.string(),
  }),
})

const BondTradeTransactionSchema = z.object({
  bondTradeTransactionState: z.string(),
  bondOffer: z.string(),
  user: z.string(),
  amountOfBonds: z.number(),
  solAmount: z.number(),
  feeAmount: z.number(),
  bondTradeTransactionType: z.string(),
  fbondTokenMint: z.string(),
  soldAt: z.number(),
  redeemedAt: z.number(),
  redeemResult: z.string(),
  seller: z.string(),
  isDirectSell: z.boolean(),
  publicKey: z.string(),
})

const FraktBondSchema = z.object({
  fraktBondState: z.string(),
  bondTradeTransactionsCounter: z.number(),
  borrowedAmount: z.number(),
  banxStake: z.string(),
  fraktMarket: z.string(),
  amountToReturn: z.number(),
  actualReturnedAmount: z.number(),
  terminatedCounter: z.number(),
  fbondTokenMint: z.string(),
  fbondTokenSupply: z.number(),
  activatedAt: z.number(),
  liquidatingAt: z.number(),
  fbondIssuer: z.string(),
  repaidOrLiquidatedAt: z.number(),
  currentPerpetualBorrowed: z.number(),
  lastTransactedAt: z.number(),
  refinanceAuctionStartedAt: z.number(),
  publicKey: z.string(),
})

export const LoanSchema = z.object({
  publicKey: z.string(),
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  nft: NFTSchema,
})

export type Loan = z.infer<typeof LoanSchema>
