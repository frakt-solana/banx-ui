import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { throttle } from 'lodash'

type UseContainerWidth = (stopWidth: number) => {
  containerWidth: number
  containerRef: MutableRefObject<HTMLDivElement | null>
}

export const useContainerWidth: UseContainerWidth = (stopWidth = 0) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [containerWidth, setContainerWidth] = useState<number>(0)

  useLayoutEffect(() => {
    setContainerWidth(containerRef.current?.clientWidth || 0)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > stopWidth) {
        setContainerWidth(containerRef.current?.clientWidth || 0)
      }
    }

    const throttledResize = throttle(handleResize, 200)
    window.addEventListener('resize', throttledResize)

    return () => window.removeEventListener('resize', throttledResize)
  }, [stopWidth])

  return {
    containerWidth,
    containerRef,
  }
}
