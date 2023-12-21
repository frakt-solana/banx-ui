import { FC } from 'react'

import { OnboardingModal, OnboardingModalContentType } from '@banx/components/modals'

import { LifeRing } from '@banx/icons'
import { useModal } from '@banx/store'

import { Button } from './Button'

import styles from './Buttons.module.less'

interface OnboardButtonProps {
  contentType: `${OnboardingModalContentType}`
}

export const OnboardButton: FC<OnboardButtonProps> = ({ contentType }) => {
  const { open, close } = useModal()

  const openModal = () => {
    open(OnboardingModal, { contentType, onCancel: close })
  }

  return (
    <Button type="circle" variant="text" className={styles.onboardBtn} onClick={openModal}>
      <LifeRing />
      <span>How it works?</span>
    </Button>
  )
}
