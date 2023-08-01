import { FC } from 'react'

export interface AppNavigationLinkProps {
  pathname: string
  label: string
  icon?: FC
  primary?: boolean
  className?: string
}

export interface NavigationLinkProps {
  href: string
  label: string
  icon?: FC
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
