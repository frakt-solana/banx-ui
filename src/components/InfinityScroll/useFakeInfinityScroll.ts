import { useEffect, useState } from 'react'

import { useIntersection } from '@banx/hooks/useIntersection'
import { debounce } from 'lodash'

export const useFakeInfinityScroll = ({
  rawData = [],
  enabled = false,
  itemsPerScroll: initialItemsPerScroll = 15,
}) => {
  const { ref, inView } = useIntersection()
  const [itemsPerScroll, setItemsPerScroll] = useState<number>(initialItemsPerScroll)

  const next = debounce(() => {
    setItemsPerScroll(itemsPerScroll + itemsPerScroll)
  }, 500)

  useEffect(() => {
    if (inView && rawData.length >= itemsPerScroll && enabled) {
      next()
    }
  }, [inView, rawData, itemsPerScroll, enabled])

  const data = rawData.slice(0, itemsPerScroll)

  return {
    data,
    fetchMoreTrigger: ref,
  }
}
