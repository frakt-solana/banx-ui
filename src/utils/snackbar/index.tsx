import { Key, ReactNode } from 'react'

import { notification } from 'antd'
import { NotificationPlacement } from 'antd/es/notification/interface'
import classNames from 'classnames'
import { uniqueId } from 'lodash'
import { ConfirmTransactionErrorReason } from 'solana-transactions-executor'

import { CloseModal, LoaderCircle } from '@banx/icons'

import {
  SnackDescription,
  SnackDescriptionProps,
  SnackMessage,
  SnackMessageProps,
} from './components'

import styles from './Snackbar.module.less'

export type SnackbarType = 'info' | 'success' | 'warning' | 'error' | 'loading'

export interface SnackbarProps extends SnackMessageProps, Partial<SnackDescriptionProps> {
  icon?: ReactNode
  autoHideDuration?: number
  closable?: boolean //? Show or hide close btn
  persist?: boolean
  customKey?: Key
  placement?: NotificationPlacement
  className?: string
  closeIconClassName?: string
}

type EnqueueSnackbar = (props: SnackbarProps) => Key
export const enqueueSnackbar: EnqueueSnackbar = ({
  message,
  description,
  icon,
  type = 'info',
  autoHideDuration = 4.5,
  closable = true,
  persist = false,
  customKey,
  placement = 'bottomRight',
  className,
  closeIconClassName,
  solanaExplorerPath,
  copyButtonProps,
}) => {
  const key = customKey || uniqueId()

  notification.config({
    maxCount: 5, //? Max Notification show, drop oldest if exceed limit
  })

  const notificationIcon =
    type === 'loading' ? (
      <LoaderCircle className={styles.loadingIcon} gradientColor="#096DD9" />
    ) : (
      icon
    )

  notification.open({
    type: type === 'loading' ? 'info' : type,
    className: classNames(styles.snack, styles[`snack__${type}`], className),
    closeIcon: closable ? (
      <CloseModal className={classNames(styles.closeIcon, closeIconClassName)} />
    ) : (
      false
    ),
    message: <SnackMessage message={message} solanaExplorerPath={solanaExplorerPath} />,
    description:
      description || copyButtonProps ? (
        <SnackDescription description={description} type={type} copyButtonProps={copyButtonProps} />
      ) : undefined,
    placement,
    duration: persist ? 0 : autoHideDuration,
    icon: notificationIcon,
    key,
  })

  return key
}

export const destroySnackbar = (key?: Key) => notification.destroy(key)

export const enqueueTransactionSent = (signature: string) =>
  enqueueSnackbar({
    message: 'Transaction sent',
    type: 'info',
    solanaExplorerPath: `tx/${signature}`,
  })

export const enqueueWaitingConfirmation = (key: string) =>
  enqueueSnackbar({
    customKey: key,
    message: 'Waiting for confirmation',
    type: 'loading',
    persist: true,
  })

export const enqueueTranactionError = () =>
  enqueueSnackbar({
    message: 'Transaction failed. Please try again',
    type: 'error',
  })

export const enqueueTranactionsError = (count: number) =>
  enqueueSnackbar({
    message: `${count} transaction${count > 1 ? 's' : ''} failed. Please try again`,
    type: 'error',
  })

export const enqueueTransactionsSent = () =>
  enqueueSnackbar({
    message: 'Transactions sent',
    type: 'info',
  })

export const enqueueWaitingConfirmationSingle = (key: string, signature: string) => {
  enqueueSnackbar({
    customKey: key,
    message: 'Waiting for confirmation',
    type: 'loading',
    persist: true,
    solanaExplorerPath: `tx/${signature}`,
  })
}

export const enqueueConfirmationError = (
  signature: string,
  reason: ConfirmTransactionErrorReason,
) => {
  if (reason === ConfirmTransactionErrorReason.TimeoutError) {
    return enqueueSnackbar({
      message: 'Unable to find out transaction result. Please check in explorer and try again',
      type: 'warning',
      autoHideDuration: 7,
      solanaExplorerPath: `tx/${signature}`,
    })
  }
  return enqueueTranactionError()
}
