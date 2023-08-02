import { FC } from 'react'

import classNames from 'classnames'

import { WalletAvatar } from '@frakt/icons'

import styles from './UserAvatar.module.less'

interface UserAvatarProps {
  imageUrl?: string
  className?: string
}

const UserAvatar: FC<UserAvatarProps> = ({ imageUrl, className }) => {
  const avatar = imageUrl ? <img src={imageUrl} alt="user avatar" /> : <WalletAvatar />

  return <div className={classNames(styles.avatar, className)}>{avatar}</div>
}

export default UserAvatar
