import { FC } from 'react'

import classNames from 'classnames'

import { LoaderCircle } from '@banx/icons'

import styles from './styles.module.less'

interface LoaderProps {
  size?: 'large' | 'default' | 'small'
  className?: string
}

export const Loader: FC<LoaderProps> = ({ size = 'default', className }) => {
  return (
    <LoaderCircle
      className={classNames([
        className,
        styles.loader,
        { [styles.small]: size === 'small' },
        { [styles.large]: size === 'large' },
      ])}
    />
  )
}

export const ModalLoader: FC<LoaderProps> = ({ className }) => {
  return <div className={classNames(styles.load, className)}></div>
}
