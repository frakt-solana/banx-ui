import { useRef, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'

import { fetchTopBarNotification } from '@frakt/api/common'
import { CloseModal } from '@frakt/icons'

import styles from './TopNotification.module.less'

const useTopNotification = () => {
  const notificationRef = useRef<HTMLDivElement>(null)
  const [closed, setClosed] = useState(false)

  const { data: topbarNotificationHtml } = useQuery(
    ['topBarNotification'],
    fetchTopBarNotification,
    {
      staleTime: 30 * 60 * 1000, // 30 mins
      refetchOnWindowFocus: false,
    },
  )

  const close = () => {
    setClosed(true)
  }

  return {
    content: topbarNotificationHtml,
    notificationRef,
    hidden: !!(closed || !topbarNotificationHtml),
    close,
  }
}

export const TopNotification = () => {
  const { content, notificationRef, hidden, close } = useTopNotification()

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.wrapper__hidden]: hidden,
      })}
      ref={notificationRef}
    >
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: content as string }} />
      <div className={styles.closeIcon} onClick={close}>
        <CloseModal />
      </div>
    </div>
  )
}
