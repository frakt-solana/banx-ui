import classNames from 'classnames'

import { Burger, BurgerClose } from '@banx/icons'

import {
  EXTERNAL_LINKS,
  ExternalLinks,
  InternalLink,
  NAVIGATION_LINKS,
  SECONDARY_NAVIGATION_LINKS,
} from '../Navbar'
import { useBurgerMenu } from './hooks'

import styles from './BurgerMenu.module.less'

const navigationsLinks = [...NAVIGATION_LINKS, ...SECONDARY_NAVIGATION_LINKS]

const BurgerMenu = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()

  return (
    <div
      className={classNames(styles.burgerMenu, { [styles.hidden]: !isVisible })}
      onClick={toggleVisibility}
    >
      <ul className={styles.navigationList}>
        {navigationsLinks.map((link) => (
          <InternalLink key={link.label} className={styles.link} {...link} />
        ))}
      </ul>
      <div className={styles.communityContainer}>
        <p className={styles.communitySubtitle}>Community</p>
        <ExternalLinks links={EXTERNAL_LINKS} />
      </div>
    </div>
  )
}

export default BurgerMenu

export const BurgerIcon = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()
  return (
    <div onClick={toggleVisibility} className={styles.burgerIcon}>
      {isVisible ? <BurgerClose /> : <Burger />}
    </div>
  )
}
