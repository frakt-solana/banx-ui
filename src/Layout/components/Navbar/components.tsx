import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { NavLink } from 'react-router-dom'

import { PATHS } from '@banx/router'
import { createPathWithTokenParam, useTokenType } from '@banx/store/nft'
import { toLowerCaseNoSpaces, trackNavigationEvent } from '@banx/utils'

import { isActivePath } from './helpers'
import { ExternalLinkProps, InternalLinkProps } from './types'

import styles from './Navbar.module.less'

export const InternalLink: FC<InternalLinkProps & { tokenType: LendingTokenType }> = ({
  label,
  pathname = '',
  icon: Icon,
  className,
  primary,
  tokenType,
}) => {
  const onLinkClickHandler = () => {
    trackNavigationEvent(toLowerCaseNoSpaces(label))
  }

  return (
    <NavLink
      to={createPathWithTokenParam(pathname, tokenType)}
      onClick={onLinkClickHandler}
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

const ExternalLink: FC<ExternalLinkProps> = ({ label, icon: Icon, href }) => {
  const onLinkClickHandler = () => {
    trackNavigationEvent(toLowerCaseNoSpaces(label))
  }

  return (
    <a href={href} rel="noopener noreferrer" target="_blank" onClick={onLinkClickHandler}>
      {Icon && <Icon />}
    </a>
  )
}

export const NavigationsLinks: FC<{ links: InternalLinkProps[] }> = ({ links }) => {
  const { tokenType } = useTokenType()

  return (
    <div className={styles.internalLinks}>
      {links.map((option) => (
        <InternalLink key={option.label} {...option} tokenType={tokenType} />
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
