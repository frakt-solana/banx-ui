import { FC } from 'react'

import produce from 'immer'
import { create } from 'zustand'

interface UseModalState<P> {
  props: P | object | null
  ModalComponent: FC<P> | null
  openModal: <P>(Component: FC<P>, props?: P | object | null) => void
  closeModal: () => void
}

//? Only for usage inside ModalPortal
// eslint-disable-next-line @typescript-eslint/ban-types
export const useModalState = create<UseModalState<{}>>((set) => ({
  props: null,
  ModalComponent: null,
  openModal: (Component, props = null) =>
    set(produce((state) => ({ ...state, ModalComponent: Component, props }))),
  closeModal: () => set((state) => ({ ...state, ModalComponent: null, props: null })),
}))

export const useModal = () => {
  const { openModal, closeModal } = useModalState()

  return {
    open: openModal,
    close: closeModal,
  }
}
