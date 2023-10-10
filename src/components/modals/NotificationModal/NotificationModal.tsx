import { FC, useLayoutEffect, useRef } from 'react'

import { Modal } from '@banx/components/modals/BaseModal'

import styles from './NotificationModal.module.less'

interface NotificationModalProps {
  htmlContent: string | undefined
  onCancel: () => void
}

export const NotificationModal: FC<NotificationModalProps> = ({ htmlContent, onCancel }) => {
  //? Add event listener for each link in html from BE. To auto hide and close modal when user clicks on link
  const contentRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (htmlContent && contentRef.current) {
      const links: NodeList = contentRef.current.querySelectorAll('a')
      links?.forEach((link) => link.addEventListener('click', onCancel))
    }
  }, [htmlContent, onCancel])

  return (
    <Modal open centered onCancel={onCancel} maskClosable={false} width={500} footer={false}>
      <div
        className={styles.content}
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: htmlContent || '' }}
      />
    </Modal>
  )
}
