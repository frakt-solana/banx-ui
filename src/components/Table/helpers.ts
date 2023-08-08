import { get } from 'lodash'

import { ActiveRowParams } from './types'

//TODO: Need to simplify this function
export const getCardOrRowClassName = <T>(
  record: T,
  params?: ActiveRowParams,
  isCard = false,
): string => {
  if (!params) return ''

  const fieldValue = !!get(record, params.field)
  const hasDesiredValue = fieldValue === params.value

  if (hasDesiredValue && isCard) return params.cardClassName || ''
  if (hasDesiredValue) return params.className

  return ''
}
