import { Sources, SourcesNumber } from './types'

export const convertToSourcesNumber = (sources: Sources): SourcesNumber => {
  return sources.map(([source, amount]) => [source, parseFloat(amount)])
}
