import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { BurgerClose } from '@banx/icons'

import { useBanxNotificationsSider } from '../hooks'

import styles from './BanxNotificationsSider.module.less'

export const Header: FC = () => {
  const { setVisibility } = useBanxNotificationsSider()

  const title = 'Settings'

  return (
    <div className={styles.header}>
      <div className={styles.headerTitleContainer}>
        <h2 className={styles.headerTitle}>{title}</h2>
        <Button type="circle" variant="secondary" onClick={() => setVisibility(false)}>
          <BurgerClose />
        </Button>
      </div>
    </div>
  )
}
