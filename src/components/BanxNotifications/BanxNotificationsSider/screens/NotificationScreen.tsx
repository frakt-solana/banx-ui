import { FC, useEffect, useRef } from 'react'

import classNames from 'classnames'
import moment from 'moment'

import { BanxNotification } from '@banx/api/user'
import { useIntersectionObserver, useUserNotifications } from '@banx/hooks'
import { BellSlash } from '@banx/icons'

import { LoadingScreen } from './LoadingScreen'

import styles from '../BanxNotificationsSider.module.less'

export const NotificationsScreen = () => {
  const { notifications, isLoading, markRead } = useUserNotifications()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!notifications?.length) {
    return <NoNotificationsContent />
  }

  return (
    <div className={styles.content}>
      <div className={styles.notficationsList}>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            markAsRead={() => markRead([notification.id])}
          />
        ))}
      </div>
    </div>
  )
}

const NoNotificationsContent = () => {
  return (
    <div className={classNames(styles.content, styles.contentCentered)}>
      <BellSlash />
      <p className={styles.noNotificationsText}>You have no new notifications</p>
    </div>
  )
}

interface NotificationCardProps {
  notification: BanxNotification
  markAsRead: () => void
}

const NotificationCard: FC<NotificationCardProps> = ({ notification, markAsRead }) => {
  const { image, message, date, isRead } = notification

  const ref = useRef<HTMLDivElement | null>(null)
  const entry = useIntersectionObserver(ref, {})
  const isVisible = !!entry?.isIntersecting

  useEffect(() => {
    if (isRead) return

    let timerId: ReturnType<typeof setTimeout> | null = null
    if (isVisible) {
      timerId = setTimeout(() => markAsRead(), 1000)
    } else {
      timerId && clearTimeout(timerId)
    }

    return () => {
      timerId && clearTimeout(timerId)
    }
  }, [isVisible, isRead, markAsRead])

  return (
    <div className={styles.notificationCard} ref={ref}>
      <div
        className={classNames(styles.notificationCardInfo, {
          [styles.notificationCardUnread]: !isRead,
        })}
      >
        {image && (
          <img src={image} alt="Notification image" className={styles.notificationCardImg} />
        )}
        <p>{message?.body}</p>
      </div>
      <p className={styles.notificationCardDate}>{moment.unix(date).fromNow()}</p>
    </div>
  )
}
