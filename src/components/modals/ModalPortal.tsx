import { useModalState } from '@banx/store/common'

export const ModalPortal = () => {
  const { ModalComponent, props } = useModalState()

  return ModalComponent ? <ModalComponent {...props} /> : null
}
