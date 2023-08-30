import { Key, ReactNode } from 'react'

import { notification } from 'antd'
import { NotificationPlacement } from 'antd/es/notification/interface'
import classNames from 'classnames'
import { uniqueId } from 'lodash'

import { CloseModal, LoaderCircle } from '@banx/icons'

import styles from './Snackbar.module.less'

export type SnackbarType = 'info' | 'success' | 'warning' | 'error' | 'loading'

export interface SnackbarProps {
  message: string
  description?: string | ReactNode
  type?: SnackbarType
  autoHideDuration?: number
  closable?: boolean //? Show or hide close btn
  persist?: boolean
  customKey?: Key
  placement?: NotificationPlacement
  className?: string
}

type EnqueueSnackbar = (props: SnackbarProps) => Key
export const enqueueSnackbar: EnqueueSnackbar = ({
  message,
  description,
  type = 'info',
  autoHideDuration = 4.5,
  closable = true,
  persist = false,
  customKey,
  placement = 'bottomRight',
  className,
}) => {
  const key = customKey || uniqueId()

  notification.open({
    type: type === 'loading' ? 'info' : type,
    className: classNames(styles.snack, styles[`snack__${type}`], className),
    closeIcon: closable ? <CloseModal className={styles.closeIcon} /> : false,
    message,
    description: description ? (
      <div
        className={classNames(
          styles.snackDescriptionWrapper,
          styles[`snackDescriptionWrapper__${type}`],
        )}
      >
        {description}
      </div>
    ) : undefined,
    placement,
    duration: persist ? 0 : autoHideDuration,
    icon:
      type === 'loading' ? (
        <LoaderCircle className={styles.loadingIcon} gradientColor="#096DD9" />
      ) : undefined,
    key,
  })

  return key
}

export const closeSnackbar = (key?: string) => notification.destroy(key)
