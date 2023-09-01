import { Key } from 'react'

import { notification } from 'antd'
import { NotificationPlacement } from 'antd/es/notification/interface'
import classNames from 'classnames'
import { uniqueId } from 'lodash'

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
  solanaExplorerPath,
  copyButtonProps,
}) => {
  const key = customKey || uniqueId()

  notification.open({
    type: type === 'loading' ? 'info' : type,
    className: classNames(styles.snack, styles[`snack__${type}`], className),
    closeIcon: closable ? <CloseModal className={styles.closeIcon} /> : false,
    message: <SnackMessage message={message} solanaExplorerPath={solanaExplorerPath} />,
    description:
      description || copyButtonProps ? (
        <SnackDescription description={description} type={type} copyButtonProps={copyButtonProps} />
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
