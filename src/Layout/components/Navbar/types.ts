import { FC } from 'react'

export interface Navigation {
  pathname?: string
  href?: string
  to?: string
  label: string
  event?: string
  icon?: FC
  iconDark?: FC
  primary?: boolean
}
