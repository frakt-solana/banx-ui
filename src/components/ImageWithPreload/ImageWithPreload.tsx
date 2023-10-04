import { FC } from 'react'

import classNames from 'classnames'

import { useImagePreload } from '@banx/hooks'

import styles from './ImageWithPreload.module.less'

interface ImageWithPreloadProps {
  src: string
  className?: string
  alt?: string
  square?: boolean
}

const ImageWithPreload: FC<ImageWithPreloadProps> = ({ src, className, alt, square = false }) => {
  const imageLoaded = useImagePreload(src)

  if (!square) {
    return imageLoaded ? (
      <img className={className} src={src} alt={alt} />
    ) : (
      <div className={classNames(styles.preload, className)}>Loading...</div>
    )
  }

  if (square && imageLoaded) {
    return (
      <div className={classNames(styles.squareWrapper, className)}>
        <img src={src} alt={alt} />
      </div>
    )
  }

  return (
    <div className={classNames(styles.preload, styles.squareWrapper, className)}>Loading...</div>
  )
}

export default ImageWithPreload
