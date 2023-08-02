import { FC, PropsWithChildren } from 'react'

import { Modal as ModalAnt, ModalProps as ModalAntProps } from 'antd'
import classNames from 'classnames'

import { CloseConfirmModal } from '@banx/icons'

import styles from './BaseModal.module.less'

interface ModalProps extends ModalAntProps {
  className?: string
}

export const Modal: FC<PropsWithChildren<ModalProps>> = ({ children, className, ...props }) => {
  return (
    <ModalAnt
      {...props}
      className={classNames(styles.modal, className)}
      wrapClassName={styles.wrap}
      closeIcon={<CloseConfirmModal className={styles.closeIcon} />}
    >
      {children}
    </ModalAnt>
  )
}
