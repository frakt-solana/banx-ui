import { FC } from 'react'

import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Theme, useTheme } from '@frakt/hooks'

import { isActivePath } from './helpers'
import { LinkProps, MenuItemProps } from './types'

import styles from './Navbar.module.less'

const Link: FC<LinkProps> = ({ href, pathname = '', icon: Icon, label, className, primary }) => {
  const linkProps = {
    className: classNames(styles.link, className, {
      [styles.active]: isActivePath(pathname),
      [styles.primary]: primary,
      [styles.secondary]: !Icon,
    }),
  }

  if (href) {
    return (
      <a href={href} rel="noopener noreferrer" target="_blank" {...linkProps}>
        {Icon && <Icon />}
        {label && <span>{label}</span>}
      </a>
    )
  }

  return (
    <NavLink to={pathname} {...linkProps}>
      {Icon && <Icon />}
      {label && <span>{label}</span>}
    </NavLink>
  )
}

export const MenuItem: FC<MenuItemProps> = (props) => {
  const { theme } = useTheme()
  const { icons } = props || {}

  const Icon = theme === Theme.LIGHT ? icons?.light : icons?.dark

  return <Link {...props} icon={Icon} />
}

export const NavigationsLinks: FC<{ options: MenuItemProps[] }> = ({ options = [] }) => (
  <div className={styles.navigationLinksWrapper}>
    {options.map((option) => (
      <MenuItem key={option.label} {...option} />
    ))}
  </div>
)
