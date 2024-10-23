import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Modal } from '@banx/components/modals/BaseModal'

import styles from './SubscribeNotificationsModal.module.less'

interface SubscribeNotificationsModalProps {
  title: string
  message: string
  onActionClick?: () => void
  onCancel: () => void
}

export const SubscribeNotificationsModal: FC<SubscribeNotificationsModalProps> = ({
  title,
  message,
  onCancel,
  onActionClick,
}) => {
  return (
    <Modal open centered onCancel={onCancel} maskClosable={false} width={572} footer={false}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.content}>{message}</p>
      {onActionClick && (
        <>
          <div className={styles.divider} />
          <Button className={styles.actionBtn} onClick={onActionClick}>
            Notify me
          </Button>
        </>
      )}
    </Modal>
  )
}

export const createLoanSubscribeNotificationsTitle = (loansAmount = 1) => {
  if (loansAmount > 1) {
    return `You have successfully taken ${loansAmount} loans`
  }

  return `You have successfully taken the loan`
}

export const createLoanSubscribeNotificationsContent = (showSubscribe = true) => {
  const subscribeMessage = showSubscribe
    ? "Please use the notifications so that you don't forget to repay your loans on time"
    : ''

  return subscribeMessage
}

export const createRefinanceSubscribeNotificationsTitle = (loansAmount = 1) => {
  if (loansAmount > 1) {
    return `You have successfully lent ${loansAmount} loans`
  }

  return 'You have successfully lent the loan'
}

export const createRefinanceSubscribeNotificationsContent = () =>
  'Please use the notifications to check the status of your offers'

//? Loans listings
export const createLoanListingSubscribeNotificationsTitle = (loansAmount = 1) => {
  if (loansAmount > 1) {
    return `You have successfully placed ${loansAmount} listings`
  }

  return `You have successfully placed the loan listing`
}

export const createLoanListingSubscribeNotificationsContent = (showSubscribe = true) => {
  return showSubscribe
    ? 'Please use the notifications so that you will know lenders accept your listings'
    : ''
}
