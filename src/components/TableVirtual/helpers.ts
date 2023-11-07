import { TableRowActiveParams } from './types'

export const getCardOrRowClassName = <T>(
  record: T,
  params?: TableRowActiveParams<T>,
  isCard = false,
): string => {
  if (!params || params.length === 0) return ''

  const matchedParams = params.find(({ condition }) => condition && condition(record))

  if (matchedParams) {
    const { className, cardClassName } = matchedParams
    return isCard ? cardClassName || '' : className || ''
  }

  return ''
}
