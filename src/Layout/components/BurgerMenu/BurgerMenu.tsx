import classNames from 'classnames'

import { MenuItem } from '../Navbar/NavigationComponents'
import { CommunityLinks } from './components'
import { communityLinks, navigationsLinks } from './constants'
import { useBurgerMenu } from './hooks'

import styles from './BurgerMenu.module.less'

const BurgerMenu = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()

  return (
    <div
      className={classNames(styles.burgerMenuWrapper, { [styles.hidden]: !isVisible })}
      onClick={toggleVisibility}
    >
      <ul className={styles.navigationList}>
        {navigationsLinks.map((link) => (
          <MenuItem key={link.label} className={styles.link} {...link} />
        ))}
      </ul>
      {communityLinks.map((communityLink, idx) => (
        <div key={idx} className={styles.communityContainer}>
          <p className={styles.communitySubtitle}>{communityLink.subtitle}</p>
          <CommunityLinks links={communityLink.links} />
        </div>
      ))}
    </div>
  )
}

export default BurgerMenu
