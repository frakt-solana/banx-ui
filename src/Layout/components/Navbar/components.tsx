import { FC } from 'react'

import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { toLowerCaseNoSpaces, trackNavigationEvent } from '@banx/utils'

import { isActivePath } from './helpers'
import { ExternalLinkProps, InternalLinkProps } from './types'

import styles from './Navbar.module.less'

export const InternalLink: FC<InternalLinkProps> = ({
  label,
  pathname = '',
  icon: Icon,
  className,
  primary,
}) => {
  const onLinkClickHandler = () => {
    trackNavigationEvent(toLowerCaseNoSpaces(label))
  }

  return (
    <NavLink
      to={pathname}
      onClick={onLinkClickHandler}
      className={classNames(styles.link, className, {
        [styles.active]: isActivePath(pathname),
        [styles.primary]: primary,
        [styles.secondary]: !Icon,
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

export const NavigationsLinks: FC<{ links: InternalLinkProps[] }> = ({ links }) => (
  <div className={styles.internalLinks}>
    {links.map((option) => (
      <InternalLink key={option.label} {...option} />
    ))}
  </div>
)

export const ExternalLinks: FC<{ links: ExternalLinkProps[] }> = ({ links }) => (
  <div className={styles.externalLinks}>
    {links.map((option) => (
      <ExternalLink key={option.label} {...option} />
    ))}
  </div>
)
