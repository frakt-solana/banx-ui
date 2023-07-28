import { useCallback, useEffect, useRef, useState } from 'react'

import { FetchNextPageOptions, InfiniteQueryObserverResult } from '@tanstack/react-query'

type FetchNextPageFunction<T> = (
  options?: FetchNextPageOptions,
) => Promise<InfiniteQueryObserverResult<{ pageParam: number; data: T[] }, unknown>>

type UseScrollPaginationOptions<T> = {
  scrollContainer: Element
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: FetchNextPageFunction<T>
  enable: boolean
}

const MARGIN_ROOT_PX = 10

export const useScrollPagination = <T>({
  scrollContainer,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  enable,
}: UseScrollPaginationOptions<T>): { isLoading: boolean } => {
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      const { scrollHeight, scrollTop, clientHeight } = scrollContainer
      const isScrollEnd = scrollHeight - scrollTop - MARGIN_ROOT_PX < clientHeight
      const canFetchNextPage = hasNextPage && !isFetchingNextPage

      if (isScrollEnd && canFetchNextPage) {
        setIsLoading(true)
        fetchNextPage().then(() => {
          setIsLoading(false)
        })
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (scrollContainer && enable) {
      scrollContainerRef.current = scrollContainer as HTMLElement
      scrollContainer.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [scrollContainer, hasNextPage, isFetchingNextPage, fetchNextPage, handleScroll, enable])

  return { isLoading }
}
