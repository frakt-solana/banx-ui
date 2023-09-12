import { get } from 'lodash'

import { ActiveRowParams } from './types'

export const getCardOrRowClassName = <T>(
  record: T,
  params?: ActiveRowParams<T>,
  isCard = false,
): string => {
  if (!params) return ''

  const { field, condition, cardClassName, className } = params

  const fieldValue = field ? get(record, field) : record

  const meetsCondition = condition(fieldValue)

  if (meetsCondition && isCard) return cardClassName || ''
  if (meetsCondition) return className || ''

  return ''
}
