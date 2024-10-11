import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { Bell } from '@banx/icons'

import { useBanxNotificationsSider } from '../BanxNotificationsSider'
import { BUTTON_ID } from '../constants'

import styles from './BanxNotificationsButton.module.less'

interface BanxNotificationsButtonProps {
  className?: string
}

export const BanxNotificationsButton: FC<BanxNotificationsButtonProps> = ({ className }) => {
  const { isVisible, toggleVisibility } = useBanxNotificationsSider()

  const onIconClick = () => {
    toggleVisibility()
  }

  return (
    <Button
      type="circle"
      variant="tertiary"
      id={BUTTON_ID}
      className={classNames(styles.button, { [styles.buttonActive]: isVisible }, className)}
      onClick={onIconClick}
    >
      <Bell />
    </Button>
  )
}
