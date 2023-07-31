import { FC } from 'react'

import classNames from 'classnames'

import styles from './UserAvatar.module.less'

const icon = (
  <svg viewBox="0 0 50 50">
    <circle
      className={styles.iconContainer}
      cx="25"
      cy="25"
      r="24.5"
      fill="#191919"
      stroke="#4D4D4D"
    />
    <circle className={styles.iconShape} cx="25" cy="21" r="10" fill="#4D4D4D" />
    <path
      className={styles.iconShape}
      fill="#4D4D4D"
      d="M25.0001 31C17.4386 31 10.7681 34.8148 6.80811 40.6247C6.80811 40.6247 13.0005 49 25.0001 49C36.9996 49 43.192 40.6247 43.192 40.6247C39.232 34.8148 32.5615 31 25.0001 31Z"
    />
  </svg>
)

interface UserAvatar {
  className?: string
  imageUrl?: string
}

export const UserAvatar: FC<UserAvatar> = ({ className, imageUrl }) => {
  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.content}>
        {imageUrl ? <img className={styles.avatar} alt="user avatar" src={imageUrl} /> : icon}
      </div>
    </div>
  )
}
