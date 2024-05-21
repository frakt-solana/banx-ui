import { FC } from 'react'

import { OnboardingModal, OnboardingModalContentType } from '@banx/components/modals'

import { LifeRing } from '@banx/icons'
import { useModal } from '@banx/store/common'

import { Button } from './Button'

import styles from './Buttons.module.less'

interface OnboardButtonProps {
  contentType: `${OnboardingModalContentType}`
  title: string
}

export const OnboardButton: FC<OnboardButtonProps> = ({ title, contentType }) => {
  const { open, close } = useModal()

  const openModal = () => {
    open(OnboardingModal, { contentType, onCancel: close })
  }

  return (
    <Button type="circle" variant="text" className={styles.onboardBtn} onClick={openModal}>
      <LifeRing />
      <span className={styles.instructionsLabel}>How it works?</span>
      <span className={styles.pageTitle}>{title}</span>
    </Button>
  )
}
