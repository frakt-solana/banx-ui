import { FC } from 'react'

interface LinkProps {
  label: string
  className?: string
  icon?: FC
}

export interface InternalLinkProps extends LinkProps {
  pathname?: string
  primary?: boolean
}

export interface ExternalLinkProps extends LinkProps {
  href: string
}
