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
  href?: string
  pathname?: string
  icon?: FC
  label?: string
  className?: string
  primary?: boolean
}
