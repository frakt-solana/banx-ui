import { FC } from 'react'

import produce from 'immer'
import { create } from 'zustand'

type EmptyObject = Record<string, never>

interface UseModalState<P> {
  props: P | object | null
  ModalComponent: FC<P> | null
  openModal: <P>(Component: FC<P>, props?: P | object | null) => void
  closeModal: () => void
}

export const useModalState = create<UseModalState<EmptyObject>>((set) => ({
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
