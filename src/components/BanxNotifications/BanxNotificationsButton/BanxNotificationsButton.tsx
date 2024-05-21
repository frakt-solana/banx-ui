import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { useBurgerMenu } from '@banx/Layout/components/BurgerMenu/hooks'
import { Bell } from '@banx/icons'

import { useBanxNotificationsSider } from '../BanxNotificationsSider'
import { BUTTON_ID } from '../constants'

import styles from './BanxNotificationsButton.module.less'

export const BanxNotificationsButton: FC = () => {
  const { isVisible, toggleVisibility } = useBanxNotificationsSider()
  const { setVisibility: setBurgerMenuVisibility } = useBurgerMenu()

  const onIconClick = () => {
    toggleVisibility()
    if (!isVisible) {
      setBurgerMenuVisibility(false)
    }
  }

  return (
    <Button
      type="circle"
      variant="text"
      id={BUTTON_ID}
      className={classNames(styles.button, { [styles.buttonActive]: isVisible })}
      onClick={onIconClick}
    >
      <Bell />
      <span className={styles.buttonText}>Notifications</span>
    </Button>
  )
}
