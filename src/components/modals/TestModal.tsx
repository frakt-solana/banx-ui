import { FC } from 'react'

import { Modal } from 'antd'

import { useModal } from '@banx/store'

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
