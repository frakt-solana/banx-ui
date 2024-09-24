import { ExternalLinks, NavigationsLinks } from './components'
import { EXTERNAL_LINKS, NAVIGATION_LINKS, SECONDARY_NAVIGATION_LINKS } from './constants'

import styles from './Navbar.module.less'

export const Navbar = () => {
  return (
    <div className={styles.navbar}>
      <NavigationsLinks links={NAVIGATION_LINKS} />
      <NavigationsLinks links={SECONDARY_NAVIGATION_LINKS} />
      <ExternalLinks links={EXTERNAL_LINKS} />
    </div>
  )
}
