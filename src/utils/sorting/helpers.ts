import { chain } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { SortOrder } from './constants'

interface CreateSortParamsProps {
  sortOptionValue: string
  setSortOptionValue: (value: string) => void
  defaultOption: SortOption
  options: SortOption[]
}

export const createSortParams = ({
  sortOptionValue,
  setSortOptionValue,
  defaultOption,
  options,
}: CreateSortParamsProps) => {
  const [field] = sortOptionValue.split('_')

  const { value: defaultOptionValue, label: defaultOptionLabel } = defaultOption

  const option = {
    label: options.find(({ value }) => value === field)?.label || defaultOptionLabel,
    value: sortOptionValue || defaultOptionValue,
  }

  return {
    option,
    onChange: (option: SortOption) => setSortOptionValue(option.value),
    options,
  }
}

type ValueGetter<T> = (item: T) => number | null
export type SortValueMap<T> = Record<string, ValueGetter<T>>

export const sortDataByValueMap = <T>(
  data: T[],
  sortOptionValue: string,
  sortValueMap: SortValueMap<T>,
) => {
  if (!sortOptionValue) return data

  const [field, order] = sortOptionValue.split('_')

  return chain(data)
    .sortBy((market) => sortValueMap[field](market))
    .thru((sorted) => (order === SortOrder.DESC ? sorted.reverse() : sorted))
    .value()
}
