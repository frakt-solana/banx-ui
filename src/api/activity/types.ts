import { z } from 'zod'

import { BasePaginationRequest, PaginationMeta } from '@banx/types'

import {
  ActivityCollectionsListSchema,
  BorrowerActivitySchema,
  LenderActivitySchema,
} from './schemas'

export type LenderActivity = z.infer<typeof LenderActivitySchema>

interface LenderActivityRequest extends BasePaginationRequest {
  walletPubkey: string
  collection?: string[]
}

export type FetchLenderActivity = (props: LenderActivityRequest) => Promise<LenderActivity[]>

export interface LenderActivityResponse {
  data: LenderActivity[]
  meta: PaginationMeta
}

export type BorrowerActivity = z.infer<typeof BorrowerActivitySchema>

interface BorrowerActivityRequest extends BasePaginationRequest {
  walletPubkey: string
  collection?: string[]
}

export type FetchBorrowerActivity = (props: BorrowerActivityRequest) => Promise<BorrowerActivity[]>

export interface BorrowedActivityResponse {
  data: BorrowerActivity[]
  meta: PaginationMeta
}

export type ActivityCollectionsList = z.infer<typeof ActivityCollectionsListSchema>

export type FetchActivityCollectionsList = (props: {
  walletPubkey: string
  userType: 'borrower' | 'lender'
}) => Promise<ActivityCollectionsList>
