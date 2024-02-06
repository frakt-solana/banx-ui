import { useEffect, useState } from 'react'

export const useImagePreload = (src: string): boolean => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)

  useEffect(() => {
    const img = new Image()

    const handleLoad = () => {
      setImageLoaded(true)
    }

    img.addEventListener('load', handleLoad)
    img.src = src

    return () => {
      img.src = ''
      img.removeEventListener('load', handleLoad)
    }
  }, [src])

  return imageLoaded
}
