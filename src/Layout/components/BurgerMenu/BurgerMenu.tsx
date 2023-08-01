import { FC } from 'react'

import classNames from 'classnames'

import { Theme, useTheme } from '@frakt/hooks'

import { MenuItem } from '../Navbar/NavigationComponents'
import {
  COMMUNITY_LINKS,
  DOCUMENTATIONS_LINKS,
  NAVIGATION_LINKS,
  SECONDARY_NAVIGATION_LINKS,
} from '../Navbar/constants'
import { useBurgerMenu } from './hooks'

import styles from './BurgerMenu.module.less'

const BurgerMenu = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()

  return (
    <div
      className={classNames(styles.wrapper, { [styles.hidden]: !isVisible })}
      onClick={toggleVisibility}
    >
      <ul className={styles.navigation}>
        {[...NAVIGATION_LINKS, ...SECONDARY_NAVIGATION_LINKS].map((link) => (
          <MenuItem key={link.label} className={styles.link} {...link} />
        ))}
      </ul>
      <div className={styles.community}>
        <p className={styles.subtitle}>Community</p>
        <LinkList links={COMMUNITY_LINKS} />
      </div>
      <div className={styles.documentation}>
        <p className={styles.subtitle}>Documentation</p>
        <LinkList links={DOCUMENTATIONS_LINKS} />
      </div>
    </div>
  )
}

export default BurgerMenu

const LinkList: FC<{ links: { icons: { dark: FC; light: FC }; href: string }[] }> = ({ links }) => {
  const { theme } = useTheme()

  return (
    <div className={styles.icons}>
      {links.map(({ icons, href }, idx) => {
        const Icon = theme === Theme.LIGHT ? icons?.light : icons?.dark

        return (
          <a key={idx} target="_blank" rel="noopener noreferrer" href={href}>
            <Icon />
          </a>
        )
      })}
    </div>
  )
}

export const BurgerIcon = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()

  return (
    <div
      className={classNames(styles.burgerIcon, { [styles.active]: isVisible })}
      onClick={toggleVisibility}
    >
      <div className={styles.centerIconLine} />
    </div>
  )
}
