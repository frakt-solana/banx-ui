import { FC, MouseEvent, PropsWithChildren } from 'react'

import classNames from 'classnames'

import { getSizeClassName } from './helpers'

import styles from './Buttons.module.less'

export interface ButtonProps {
  className?: string
  disabled?: boolean
  onClick?: (args: MouseEvent<HTMLButtonElement>) => void
  type?: 'standard' | 'circle' | 'square'
  variant?: 'primary' | 'secondary' | 'link' | 'text'
  size?: 'small' | 'medium' | 'large'
}

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  className,
  disabled = false,
  onClick,
  type = 'standard',
  variant = 'primary',
  size = 'large',
  children,
}) => {
  const combinedClassName = classNames(
    styles.root,
    styles[type],
    styles[variant],
    getSizeClassName(size),
    className,
  )

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={combinedClassName}>
      {children}
    </button>
  )
}
