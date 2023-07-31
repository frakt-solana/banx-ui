import { FC } from 'react'

export interface Navigation {
  pathname?: string
  href?: string

  label: string

  icon?: FC
  iconDark?: FC

  primary?: boolean
}
