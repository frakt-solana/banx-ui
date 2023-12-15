import { FC } from 'react'

import { Carousel } from 'antd'

import { Loader } from '@banx/components/Loader'
import { Modal } from '@banx/components/modals/BaseModal'

import { ChevronDown } from '@banx/icons'

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
        <Carousel
          draggable
          nextArrow={<ChevronDown className={styles.carouselArrow} />}
          prevArrow={<ChevronDown className={styles.carouselArrow} />}
          arrows
          infinite={false}
        >
          {content.slides.map(({ text, img }, idx) => (
            <div className={styles.slide} key={idx}>
              {img}
              {text}
            </div>
          ))}
        </Carousel>
      </div>
      <div className={styles.loaderWrapper}>
        <Loader size="large" />
      </div>
    </Modal>
  )
}
