import { FC } from 'react'

import { Theme, useTheme } from '@frakt/hooks'
import { Burger, BurgerClose } from '@frakt/icons'

import { useBurgerMenu } from './hooks'

import styles from './BurgerMenu.module.less'

interface Link {
  icons: { dark: FC; light: FC }
  href: string
}

interface CommunityLinksProps {
  links: Link[]
}

export const CommunityLinks: FC<CommunityLinksProps> = ({ links }) => {
  const { theme } = useTheme()

  return (
    <div className={styles.iconContainer}>
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
    <div onClick={toggleVisibility} className={styles.burgerIcon}>
      {isVisible ? <BurgerClose /> : <Burger />}
    </div>
  )
}
