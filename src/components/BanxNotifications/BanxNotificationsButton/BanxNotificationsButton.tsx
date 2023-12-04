import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import Tooltip from '@banx/components/Tooltip/Tooltip'

import { useBurgerMenu } from '@banx/Layout/components/BurgerMenu/hooks'
// import { useUserNotifications } from '@banx/hooks'
import {
  Bell,
  /*BellWithBadge*/
} from '@banx/icons'

import { useBanxNotificationsSider } from '../BanxNotificationsSider'
import { BUTTON_ID } from '../constants'

import styles from './BanxNotificationsButton.module.less'

interface BanxNotificationsButtonProps {
  className?: string
}

export const BanxNotificationsButton: FC<BanxNotificationsButtonProps> = ({ className }) => {
  const { isVisible, toggleVisibility } = useBanxNotificationsSider()
  const { setVisibility: setBurgerMenuVisibility } = useBurgerMenu()
  // const { hasUnread } = useUserNotifications()

  const onIconClick = () => {
    toggleVisibility()
    if (!isVisible) {
      setBurgerMenuVisibility(false)
    }
  }

  return (
    <Tooltip title="Notifications">
      <>
        <Button
          type="circle"
          variant="secondary"
          id={BUTTON_ID}
          className={classNames(className, { [styles.buttonActive]: isVisible })}
          onClick={onIconClick}
        >
          {/* {hasUnread ? <BellWithBadge /> : <Bell />} */}
          <Bell />
        </Button>
      </>
    </Tooltip>
  )
}
