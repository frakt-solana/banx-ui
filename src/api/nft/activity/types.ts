import { z } from 'zod'

import {
  ActivityCollectionsListSchema,
  BorrowerActivitySchema,
  LenderActivitySchema,
} from './schemas'

export type LenderActivity = z.infer<typeof LenderActivitySchema>

export type BorrowerActivity = z.infer<typeof BorrowerActivitySchema>

export type ActivityCollectionsList = z.infer<typeof ActivityCollectionsListSchema>
