import { useEffect, useState } from 'react'

interface UseWindowSize {
  width: number
  height: number
}

const getWindowSize = (): UseWindowSize => ({
  width: window.innerWidth,
  height: window.innerHeight,
})

export const useWindowSize = (): UseWindowSize => {
  const [windowSize, setWindowSize] = useState<UseWindowSize>(getWindowSize())

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getWindowSize())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}
