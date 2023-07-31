import { FC } from 'react'

import { createNavigationsLinks } from './NavigationComponents'
import {
  COMMUNITY_LINKS,
  DOCUMENTATIONS_LINKS,
  NAVIGATION_LINKS,
  SECONDARY_NAVIGATION_LINKS,
} from './constants'

import styles from './Navbar.module.less'

export const Navbar: FC = () => {
  return (
    <div className={styles.container}>
      {createNavigationsLinks({ options: NAVIGATION_LINKS })}
      {createNavigationsLinks({ options: SECONDARY_NAVIGATION_LINKS })}
      {createNavigationsLinks({ options: COMMUNITY_LINKS })}
      {createNavigationsLinks({ options: DOCUMENTATIONS_LINKS })}
    </div>
  )
}
