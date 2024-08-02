import { z } from 'zod'

import {
  LenderTokenActivitySchema,
  TokenActivityCollectionsListSchema,
  TokenBorrowerActivitySchema,
} from './schemas'

export type LenderTokenActivity = z.infer<typeof LenderTokenActivitySchema>
export type TokenBorrowerActivity = z.infer<typeof TokenBorrowerActivitySchema>

export type TokenActivityCollectionsList = z.infer<typeof TokenActivityCollectionsListSchema>
