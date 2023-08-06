import { create } from 'zustand'

import { MOBILE_WIDTH } from '@banx/constants'

export enum ViewState {
  TABLE = 'table',
  CARD = 'card',
}

interface TableViewState {
  viewState: ViewState
  setViewState: (nextValue: ViewState) => void
}

export const useTableView = create<TableViewState>((set) => {
  const isMobileWidth = window.innerWidth < MOBILE_WIDTH

  const initialState: TableViewState = {
    viewState: isMobileWidth ? ViewState.CARD : ViewState.TABLE,
    setViewState: (nextValue) => set((state) => ({ ...state, viewState: nextValue })),
  }

  return initialState
})
