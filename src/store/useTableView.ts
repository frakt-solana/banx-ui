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

const VIEW_STORAGE_KEY = '@banx.viewState'

export const useTableView = create<TableViewState>((set) => {
  const isMobileWidth = window.innerWidth < MOBILE_WIDTH

  const savedViewState = localStorage.getItem(VIEW_STORAGE_KEY)

  const defaultViewState = isMobileWidth ? ViewState.CARD : ViewState.TABLE
  const initialViewState = savedViewState ? JSON.parse(savedViewState) : defaultViewState

  const initialState: TableViewState = {
    viewState: initialViewState,
    setViewState: (nextValue) => {
      localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(nextValue))
      set((state) => ({ ...state, viewState: nextValue }))
    },
  }

  return initialState
})
