import { FC } from 'react'

export interface MenuItemProps {
  label: string
  icons?: { light: FC; dark: FC }
  className?: string
  pathname?: string
  href?: string
  primary?: boolean
}

export interface LinkProps {
  label: string
  href?: string
  pathname?: string
  icon?: FC
  className?: string
  primary?: boolean
}
