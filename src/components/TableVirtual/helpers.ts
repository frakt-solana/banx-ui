import { ReactNode } from 'react'

import { ActiveRowParams, ColumnType } from './types'

export const getCardOrRowClassName = <T>(
  record: T,
  params?: ActiveRowParams<T>[],
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

export const createColumn = <T extends object>({
  key,
  title,
  render,
  sorter = false,
}: ColumnType<T>) => {
  return {
    key,
    title: title as ReactNode,
    render: (record: T, index: number) => render?.(record, index),
    showSorterTooltip: sorter ? false : undefined,
    sorter,
  }
}
