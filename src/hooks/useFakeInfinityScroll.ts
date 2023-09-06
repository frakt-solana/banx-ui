import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

import { debounce } from 'lodash'

import { useIntersection } from '@banx/hooks'

interface UseFakeInfinityScrollProps<T> {
  rawData: T[]
  enabled?: boolean
  itemsPerScroll?: number
}

interface UseFakeInfinityScrollResult<T> {
  data: T[]
  fetchMoreTrigger: Dispatch<SetStateAction<Element | null>>
}

export const useFakeInfinityScroll = <T>({
  rawData = [],
  enabled = !!rawData?.length,
  itemsPerScroll: initialItemsPerScroll = 15,
}: UseFakeInfinityScrollProps<T>): UseFakeInfinityScrollResult<T> => {
  const { ref, inView } = useIntersection()
  const [itemsPerScroll, setItemsPerScroll] = useState<number>(initialItemsPerScroll)

  useEffect(() => {
    const handleIntersection = debounce(() => {
      if (inView && rawData.length >= itemsPerScroll && enabled) {
        setItemsPerScroll((prevItemsPerScroll) => prevItemsPerScroll + initialItemsPerScroll)
      }
    }, 300)

    if (inView && enabled) {
      handleIntersection()
    }

    return () => {
      handleIntersection.cancel()
    }
  }, [initialItemsPerScroll, inView, rawData.length, itemsPerScroll, enabled])

  const data = useMemo(() => {
    return rawData.slice(0, itemsPerScroll)
  }, [rawData, itemsPerScroll])

  return {
    data,
    fetchMoreTrigger: ref,
  }
}
