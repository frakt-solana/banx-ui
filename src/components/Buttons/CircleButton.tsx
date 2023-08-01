import { FC, MouseEvent, PropsWithChildren, ReactNode } from 'react'

import classNames from 'classnames'

import { getSizeClassName } from './helpers'

import styles from './Buttons.module.less'

interface CircleButtonProps {
  className?: string
  disabled?: boolean
  onClick: (args: MouseEvent<HTMLButtonElement>) => void
  type?: 'primary' | 'secondary' | 'link'
  size?: 'small' | 'medium' | 'large'
  icon?: ReactNode
}

export const CircleButton: FC<PropsWithChildren<CircleButtonProps>> = ({
  className,
  disabled = false,
  onClick,
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
      className={classNames([styles.circle, styles[type], getSizeClassName(size), className])}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  )
}
