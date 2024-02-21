import { FC, MouseEvent, PropsWithChildren } from 'react'

import classNames from 'classnames'

import { LoaderCircle } from '@banx/icons'

import styles from './Buttons.module.less'

export interface ButtonProps {
  id?: string
  className?: string
  disabled?: boolean
  loading?: boolean //? Applies only for standard buttons
  onClick?: (args: MouseEvent<HTMLButtonElement>) => void
  type?: 'standard' | 'circle'
  variant?: 'primary' | 'secondary' | 'text'
  size?: 'default' | 'small'
}

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  id,
  className,
  disabled = false,
  loading = false,
  onClick,
  type = 'standard',
  variant = 'primary',
  size = 'default',
  children,
}) => {
  const applyLoadingStyle = type === 'standard' && loading

  const combinedClassName = classNames(
    styles.root,
    styles[type],
    styles[variant],
    styles[size] || styles.medium,
    { [styles.loading]: applyLoadingStyle },
    className,
  )

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {applyLoadingStyle && <LoaderCircle className={styles.loader} gradientColor="#AEAEB2" />}
      {children}
    </button>
  )
}
