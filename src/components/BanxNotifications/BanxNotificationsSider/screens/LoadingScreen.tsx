import { FC } from 'react'

import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'

import styles from '../BanxNotificationsSider.module.less'

export const LoadingScreen: FC = () => {
  return (
    <div className={classNames(styles.content, styles.contentCentered)}>
      <Loader size="large" />
    </div>
  )
}
