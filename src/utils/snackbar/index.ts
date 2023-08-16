import { Key, ReactNode } from 'react'

import { notification } from 'antd'
import { NotificationPlacement } from 'antd/es/notification/interface'
import classNames from 'classnames'
import { uniqueId } from 'lodash'

export enum NotificationTypes {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface SnackbarProps {
  message: string
  description?: string | ReactNode
  type?: NotificationTypes
  autoHideDuration?: number
  persist?: boolean
  customKey?: Key
  placement?: NotificationPlacement
  className?: string
}

type EnqueueSnackbar = (props: SnackbarProps) => Key
export const enqueueSnackbar: EnqueueSnackbar = ({
  message = '',
  description = null,
  type = NotificationTypes.INFO,
  autoHideDuration = 4.5,
  persist = false,
  customKey,
  placement = 'bottomRight',
  className,
}) => {
  const key = customKey || uniqueId()

  notification.open({
    type,
    className: classNames(`someBanxSnackClass`, className),
    message,
    description,
    placement,
    duration: persist ? 0 : autoHideDuration,
    key,
  })

  return key
}

export const closeSnackbar = (key?: string) => notification.destroy(key)
