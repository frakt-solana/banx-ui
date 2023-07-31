import { FC } from 'react'

import classNames from 'classnames'
import { isString } from 'lodash'

import { createNavigationLink, createNavigationsLinks } from './NavigationComponents'
import { DOCUMENTATIONS_LINKS, NAVIGATION_LINKS, SECONDARY_NAVIGATION_LINKS } from './constants'

import styles from './Navbar.module.less'

interface MenuItem {
  label: string
  icon?: any
  iconDark?: any
  className?: string
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
}) => {
  const isActive = location.pathname.split('/')[1] === pathname.split('/')[1]

  if (isString(pathname)) {
    return createNavigationLink({
      icon: rawIcon,
      label,
      className,
      pathname,
      isActive,
      primary,
    } as any)
  } else {
    return (
      <a
        className={classNames(styles.link, className)}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {rawIcon && rawIcon()}
        {label && <span className={styles.label}>{label}</span>}
      </a>
    )
  }
}

export const Navbar: FC = () => {
  return (
    <div className={styles.container}>
      {createNavigationsLinks({ options: NAVIGATION_LINKS })}
      {createNavigationsLinks({ options: SECONDARY_NAVIGATION_LINKS })}
      {createNavigationsLinks({ options: DOCUMENTATIONS_LINKS })}
    </div>
  )
}
