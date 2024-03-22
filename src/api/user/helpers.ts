import { BN } from 'fbonds-core'

import { Sources, SourcesBN } from './types'

export const convertToSourcesBN = (sources: Sources): SourcesBN => {
  return sources.map(([source, amount]) => [source, new BN(amount)])
}
