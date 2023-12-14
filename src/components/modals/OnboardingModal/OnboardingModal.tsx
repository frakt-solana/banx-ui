import { FC } from 'react'

import { Carousel } from 'antd'

import { Modal } from '@banx/components/modals/BaseModal'

import { CONTENT } from './content'
import { OnboardingModalContentType } from './types'

import styles from './OnboardingModal.module.less'

interface OnboardingModalProps {
  contentType?: `${OnboardingModalContentType}`
  onCancel: () => void
}

export const OnboardingModal: FC<OnboardingModalProps> = ({
  contentType = 'dashboard',
  onCancel,
}) => {
  const content = CONTENT[contentType] || CONTENT[OnboardingModalContentType.DASHBOARD]

  return (
    <Modal open centered maskClosable={false} width={572} footer={false} onCancel={onCancel}>
      <div className={styles.modalContent}>
        <h3 className={styles.title}>{content.title}</h3>
        <Carousel draggable>
          {content.slides.map(({ text, img }, idx) => (
            <div className={styles.slide} key={idx}>
              {img}
              {text}
            </div>
          ))}
        </Carousel>
      </div>
    </Modal>
  )
}
