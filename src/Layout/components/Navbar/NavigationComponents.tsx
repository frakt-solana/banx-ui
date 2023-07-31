import { FC } from 'react'

import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Theme, useTheme } from '@frakt/hooks'

import { AppNavigationLinkProps, MenuItemProps, Navigation, NavigationLinkProps } from './types'

import styles from './Navbar.module.less'

const AppNavigationLink: FC<AppNavigationLinkProps> = ({ icon, label, className, pathname }) => {
  const isActive = location.pathname.split('/')[1] === pathname?.split('/')[1]

  return (
    <NavLink
      to={pathname as string}
      className={classNames(styles.link, className, {
        [styles.active]: isActive,
        [styles.secondary]: !icon,
      })}
    >
      {icon && icon()}
      {label && <span>{label}</span>}
    </NavLink>
  )
}

const NavigationLink: FC<NavigationLinkProps> = ({ className, href, icon, label }) => {
  return (
    <a
      href={href}
      className={classNames(styles.link, className)}
      rel="noopener noreferrer"
      target="_blank"
    >
      {icon && icon()}
      {label && <span>{label}</span>}
    </a>
  )
}

export const MenuItem: FC<MenuItemProps> = (props) => {
  const { icons, href, pathname, label, className } = props || {}
  const { theme } = useTheme()

  const icon = theme === Theme.LIGHT ? icons?.light : icons?.dark

  if (href) {
    return <NavigationLink label={label} href={href} icon={icon} className={className} />
  }

  return (
    <AppNavigationLink
      pathname={pathname as string}
      label={label}
      icon={icon}
      className={className}
    />
  )
}

export const createNavigationsLinks = ({ options = [] }: { options: Navigation[] }) => (
  <div className={styles.navigation}>
    {options.map((option) => (
      <MenuItem key={option.label} {...option} />
    ))}
  </div>
)
