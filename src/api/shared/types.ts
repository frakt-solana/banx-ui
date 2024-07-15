import { z } from 'zod'

import { NFTSchema, RaritySchema } from './schemas'

export enum RarityTier {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
  Mythic = 'mythic',
}

export type Rarity = z.infer<typeof RaritySchema>

export type NFT = z.infer<typeof NFTSchema>

export type ResponseWithPagination<T> = {
  data: T
  meta: PaginationMeta
}

export interface PaginationMeta {
  skip: number
  limit: number
  totalCount: number
}

interface SortingOptions {
  sortBy: string
  order: string
}

interface PaginationOptions {
  limit?: number
  skip?: number
  state?: string
}

export type BasePaginationRequest = SortingOptions & PaginationOptions

export type MutationResponse = {
  message?: string
  success: boolean
}
