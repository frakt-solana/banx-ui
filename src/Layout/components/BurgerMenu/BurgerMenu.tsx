import { FC } from 'react'

import classNames from 'classnames'

import { Theme, useTheme } from '@frakt/hooks'

import { MenuItem } from '../Navbar'
import { NAVIGATION_LINKS, SECONDARY_NAVIGATION_LINKS } from '../Navbar/constants'
import { useBurgerMenu } from './hooks'

import styles from './BurgerMenu.module.less'

const BurgerMenu: FC = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()

  const { theme } = useTheme()

  const isDark = theme === Theme.DARK

  return (
    <>
      <div
        className={classNames(styles.burgerIcon, { [styles.active]: isVisible })}
        onClick={toggleVisibility}
      >
        <div className={styles.centerIconLine} />
      </div>
      <div
        className={classNames(styles.wrapper, { [styles.hidden]: !isVisible })}
        onClick={toggleVisibility}
      >
        <ul className={styles.navigation}>
          {[...NAVIGATION_LINKS, ...SECONDARY_NAVIGATION_LINKS].map((item, idx) => (
            <MenuItem key={`${item?.label}${idx}`} className={styles.link} {...item} />
          ))}
        </ul>
        <div className={styles.community}>
          <p className={styles.subtitle}>Community</p>
          {/* <div className={styles.icons}>
            {COMMUNITY_LINKS.map(({ icon, iconDark, href }, idx) => (
              <a key={idx} target="_blank" rel="noopener noreferrer" href={href}>
                {isDark ? iconDark(null) : icon(null)}
              </a>
            ))}
          </div> */}
        </div>
        <div className={styles.documentation}>
          <p className={styles.subtitle}>Documentation</p>
          {/* <div className={styles.icons}>
            {DOCUMENTATIONS_LINKS.map(({ icon, iconDark, href }, idx) => (
              <a key={idx} target="_blank" rel="noopener noreferrer" href={href}>
                {isDark ? iconDark(null) : icon(null)}
              </a>
            ))}
          </div> */}
        </div>
      </div>
    </>
  )
}

export default BurgerMenu
