import { FC } from 'react'

import { useModal } from '@banx/store'

import { Modal } from './BaseModal'

export interface TestModalProps {
  customText?: string
}

export const TestModal: FC<TestModalProps> = ({ customText = '' }) => {
  const { close } = useModal()

  return (
    <Modal open onCancel={close}>
      {customText || 'Hello, I am test modal'}
    </Modal>
  )
}
