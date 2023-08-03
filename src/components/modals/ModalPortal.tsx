import { useModalState } from '@banx/store'

export const ModalPortal = () => {
  const { ModalComponent, props } = useModalState()

  return ModalComponent ? <ModalComponent {...props} /> : null
}
