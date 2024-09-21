import { ModeType, useModeType } from '@banx/store/common'

import { ExternalLinks, NavigationsLinks } from './components'
import {
  EXTERNAL_LINKS,
  NFT_NAVIGATION_LINKS,
  SECONDARY_NAVIGATION_LINKS,
  TOKEN_NAVIGATION_LINKS,
} from './constants'

import styles from './Navbar.module.less'

export const Navbar = () => {
  const { modeType } = useModeType()
  const navigationLinks = modeType === ModeType.NFT ? NFT_NAVIGATION_LINKS : TOKEN_NAVIGATION_LINKS

  return (
    <div className={styles.navbar}>
      <NavigationsLinks links={navigationLinks} />
      <NavigationsLinks links={SECONDARY_NAVIGATION_LINKS} />
      <ExternalLinks links={EXTERNAL_LINKS} />
    </div>
  )
}
