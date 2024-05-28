import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { NavLink } from 'react-router-dom'

import { PATHS } from '@banx/router'
import { createPathWithParams } from '@banx/store'
import { ModeType, useModeType } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'

import { isActivePath } from './helpers'
import { ExternalLinkProps, InternalLinkProps } from './types'

import styles from './Navbar.module.less'

export const InternalLink: FC<
  InternalLinkProps & { tokenType: LendingTokenType; modeType: ModeType }
> = ({ label, pathname = '', icon: Icon, className, primary, tokenType, modeType }) => {
  return (
    <NavLink
      to={createPathWithParams(pathname, modeType, tokenType)}
      className={classNames(styles.link, className, {
        [styles.active]: isActivePath(pathname),
        [styles.primary]: primary,
        [styles.secondary]: !Icon,
        [styles.stake]: pathname === PATHS.ADVENTURES,
      })}
    >
      {Icon && <Icon />}
      {label && <span>{label}</span>}
    </NavLink>
  )
}

const ExternalLink: FC<ExternalLinkProps> = ({ icon: Icon, href }) => {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {Icon && <Icon />}
    </a>
  )
}

export const NavigationsLinks: FC<{ links: InternalLinkProps[] }> = ({ links }) => {
  const { tokenType } = useNftTokenType()
  const { modeType } = useModeType()

  return (
    <div className={styles.internalLinks}>
      {links.map((option) => (
        <InternalLink key={option.label} {...option} tokenType={tokenType} modeType={modeType} />
      ))}
    </div>
  )
}

export const ExternalLinks: FC<{ links: ExternalLinkProps[] }> = ({ links }) => (
  <div className={styles.externalLinks}>
    {links.map((option) => (
      <ExternalLink key={option.label} {...option} />
    ))}
  </div>
)
