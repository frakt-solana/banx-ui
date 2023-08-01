import { NavigationsLinks } from './NavigationComponents'
import {
  COMMUNITY_LINKS,
  DOCUMENTATIONS_LINKS,
  NAVIGATION_LINKS,
  SECONDARY_NAVIGATION_LINKS,
} from './constants'

import styles from './Navbar.module.less'

export const Navbar = () => {
  return (
    <div className={styles.navbar}>
      <NavigationsLinks options={NAVIGATION_LINKS} />
      <NavigationsLinks options={SECONDARY_NAVIGATION_LINKS} />
      <NavigationsLinks options={COMMUNITY_LINKS} />
      <NavigationsLinks options={DOCUMENTATIONS_LINKS} />
    </div>
  )
}
