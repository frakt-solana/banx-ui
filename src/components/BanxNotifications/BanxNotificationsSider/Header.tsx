import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { useUserNotifications } from '@banx/hooks'
import { Bin, BurgerClose, Settings } from '@banx/icons'

import { useBanxNotificationsSider } from '../hooks'
import { ScreenType } from './constants'

import styles from './BanxNotificationsSider.module.less'

export const Header: FC = () => {
  const { screenType, changeContentType } = useBanxNotificationsSider()
  const { notifications, clearAll } = useUserNotifications()

  const title = screenType !== ScreenType.SETTINGS ? 'Notifications' : 'Settings'

  return (
    <div className={styles.header}>
      <div className={styles.headerTitleContainer}>
        <h2 className={styles.headerTitle}>{title}</h2>
        {screenType === ScreenType.NOTIFICATIONS && (
          <Button
            type="circle"
            variant="secondary"
            onClick={() => changeContentType(ScreenType.SETTINGS)}
          >
            <Settings />
          </Button>
        )}
        {screenType === ScreenType.SETTINGS && (
          <Button
            type="circle"
            variant="secondary"
            onClick={() => changeContentType(ScreenType.NOTIFICATIONS)}
          >
            <BurgerClose />
          </Button>
        )}
      </div>
      {screenType === ScreenType.NOTIFICATIONS && !!notifications?.length && (
        <button onClick={clearAll} className={styles.clearNotificationsBtn}>
          <Bin /> Clear all
        </button>
      )}
    </div>
  )
}
