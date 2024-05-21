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
