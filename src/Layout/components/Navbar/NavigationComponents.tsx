import { FC } from 'react'

import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Theme, useTheme } from '@frakt/hooks'

import { AppNavigationLinkProps, MenuItemProps, NavigationLinkProps } from './types'

import styles from './Navbar.module.less'

const AppNavigationLink: FC<AppNavigationLinkProps> = ({
  icon,
  label,
  className,
  pathname,
  primary,
}) => {
  const isActive = location.pathname.split('/')[1] === pathname?.split('/')[1]

  return (
    <NavLink
      to={pathname as string}
      className={classNames(styles.link, className, {
        [styles.active]: isActive,
        [styles.primary]: primary,
        [styles.secondary]: !icon,
      })}
    >
      {icon && icon({})}
      {label && <span>{label}</span>}
    </NavLink>
  )
}

const NavigationLink: FC<NavigationLinkProps> = ({ className, href, icon, label }) => {
  return (
    <a
      href={href}
      className={classNames(styles.link, styles.small, className)}
      rel="noopener noreferrer"
      target="_blank"
    >
      {icon && icon({})}
      {label && <span>{label}</span>}
    </a>
  )
}

export const MenuItem: FC<MenuItemProps> = (props) => {
  const { icons, href, pathname, label, className, primary } = props || {}
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
      primary={primary}
    />
  )
}

export const createNavigationsLinks = ({ options = [] }: { options: MenuItemProps[] }) => (
  <div className={styles.navigation}>
    {options.map((option) => (
      <MenuItem key={option.label} {...option} />
    ))}
  </div>
)
