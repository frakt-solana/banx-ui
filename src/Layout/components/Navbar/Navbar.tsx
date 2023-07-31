import { FC } from 'react'

import classNames from 'classnames'
import { isFunction, isString } from 'lodash'

import { createNavigationLink, createNavigationsLinks } from './NavigationComponents'
import { NAVIGATION_LINKS, SECONDARY_NAVIGATION_LINKS } from './constants'

import styles from './Navbar.module.less'

interface MenuItem {
  label: string
  icon?: any
  iconDark?: any
  className?: string
  to?: string | ((param: string) => string)
  pathname?: string
  props?: any
  href?: string
  primary?: boolean
}

export const MenuItem: FC<MenuItem> = ({
  icon: rawIcon,
  pathname = '',
  href,
  label,
  className,
  primary,
  to,
}) => {
  const isActive = location.pathname.split('/')[1] === pathname.split('/')[1]

  const navigationParams = { icon: rawIcon, label, className, to, isActive, primary }

  if (isString(to)) {
    return createNavigationLink(navigationParams as any)
  } else if (isFunction(to)) {
    return null
  }

  return (
    <a
      className={classNames(styles.link, className)}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* {icon && icon()} */}
      {label && <span className={styles.label}>{label}</span>}
    </a>
  )
}

export const Navbar: FC = () => {
  return (
    <div className={styles.container}>
      {createNavigationsLinks({ options: NAVIGATION_LINKS })}
      {createNavigationsLinks({ options: SECONDARY_NAVIGATION_LINKS })}
    </div>
  )
}
