import { FC } from 'react'

export interface Navigation {
  pathname?: string
  href?: string

  label: string

  icon?: FC
  iconDark?: FC

  primary?: boolean
}

export interface AppNavigationLinkProps {
  pathname: string
  label: string
  icon?: any
  primary?: boolean
  className?: string
}

export interface NavigationLinkProps {
  href: string
  label: string
  icon: any
  className?: string
}

export interface MenuItemProps {
  label: string

  icons?: { light: FC; dark: FC }
  className?: string
  pathname?: string
  href?: string
  primary?: boolean
}
