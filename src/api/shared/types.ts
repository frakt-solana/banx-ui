import { z } from 'zod'

import { NFTSchema, RaritySchema } from './schemas'

export enum TokenStandard {
  CORE = 'MplCoreAsset',
}

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

type ResponsePaginationMeta = {
  skip: number
  limit: number
  totalCount: number
}
export type ResponseWithPagination<T> = {
  data: T
  meta: ResponsePaginationMeta
}

type RequestPaginationParams = {
  order?: 'desc' | 'asc'
  skip?: number
  limit?: number
  getAll?: boolean
}
export type RequestWithPagination<T> = T & RequestPaginationParams

export type MutationResponse = {
  message?: string
  success: boolean
}
