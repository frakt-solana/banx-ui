import classNames from 'classnames'

import { Burger, BurgerClose } from '@banx/icons'
import { ModeType, useModeType } from '@banx/store/common'

import {
  EXTERNAL_LINKS,
  ExternalLinks,
  NFT_NAVIGATION_LINKS,
  NavigationsLinks,
  SECONDARY_NAVIGATION_LINKS,
  TOKEN_NAVIGATION_LINKS,
} from '../Navbar'
import ThemeSwitcher from '../ThemeSwitcher'
import { useBurgerMenu } from './hooks'

import styles from './BurgerMenu.module.less'

const BurgerMenu = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()
  const { modeType } = useModeType()

  const navigationLinks = modeType === ModeType.NFT ? NFT_NAVIGATION_LINKS : TOKEN_NAVIGATION_LINKS

  return (
    <>
      {isVisible && <div className={styles.overlay} />}
      <div
        className={classNames(styles.burgerMenu, { [styles.hidden]: !isVisible })}
        onClick={toggleVisibility}
      >
        <NavigationsLinks links={navigationLinks} />
        <NavigationsLinks links={SECONDARY_NAVIGATION_LINKS} />

        <div className={styles.communityContainer}>
          <ThemeSwitcher className={styles.themeSwitcher} />
          <ExternalLinks links={EXTERNAL_LINKS} />
        </div>
      </div>
    </>
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
