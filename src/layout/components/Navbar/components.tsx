import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { NavLink } from 'react-router-dom'

import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode, useAssetMode, useTokenType } from '@banx/store/common'

import { isActivePath } from './helpers'
import { ExternalLinkProps, InternalLinkProps } from './types'

import styles from './Navbar.module.less'

export const InternalLink: FC<
  InternalLinkProps & { tokenType: LendingTokenType; modeType: AssetMode }
> = ({ label, pathname = '', icon: Icon, className, primary, tokenType, modeType }) => {
  return (
    <NavLink
      to={buildUrlWithModeAndToken(pathname, modeType, tokenType)}
      className={classNames(styles.link, className, {
        [styles.active]: isActivePath(pathname),
        [styles.primary]: primary,
        [styles.secondary]: !Icon,
        [styles.revertLayerIcon]: pathname === PATHS.ADVENTURES,
      })}
    >
      {Icon && <Icon />}
      {label && <span>{label}</span>}
    </NavLink>
  )
}

const ExternalLink: FC<ExternalLinkProps> = ({ label, icon: Icon, href, className }) => {
  return (
    <a className={className} href={href} rel="noopener noreferrer" target="_blank">
      {Icon && <Icon />} {label && <span>{label}</span>}
    </a>
  )
}

type LinksProps = { links: (InternalLinkProps | ExternalLinkProps)[] }

export const NavigationsLinks: FC<LinksProps> = ({ links }) => {
  const { tokenType } = useTokenType()
  const { currentAssetMode } = useAssetMode()

  return (
    <div className={styles.links}>
      {links.map((link) => {
        const isExternalLink = 'href' in link

        if (isExternalLink)
          return (
            <ExternalLink
              key={link.label}
              className={classNames(styles.link, styles.revertLayerIcon)}
              {...link}
            />
          )

        return (
          <InternalLink
            key={link.label}
            tokenType={tokenType}
            modeType={currentAssetMode}
            {...link}
          />
        )
      })}
    </div>
  )
}

export const ExternalLinks: FC<{ links: ExternalLinkProps[] }> = ({ links }) => (
  <div className={styles.externalLinks}>
    {links.map((option) => (
      <ExternalLink key={option.label} className={styles.hiddenExternalLabel} {...option} />
    ))}
  </div>
)
