import { FC, PropsWithChildren, ReactNode } from 'react'

import classNames from 'classnames'

import { getSizeClassName } from './helpers'

import styles from './Buttons.module.less'

interface ButtonProps {
  className?: string
  disabled?: boolean
  onClick?: (args: any) => any
  type?: 'primary' | 'secondary' | 'link'
  size?: 'small' | 'medium' | 'large'
  icon?: ReactNode
}

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  className,
  disabled = false,
  onClick = () => {},
  type = 'primary',
  children,
  size = 'large',
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classNames([styles.root, styles[type], getSizeClassName(size), className])}
    >
      {children}
      {icon && <span className={styles.icon}>{icon}</span>}
    </button>
  )
}
