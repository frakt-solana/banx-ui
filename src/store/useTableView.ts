import { create } from 'zustand'

export enum ViewState {
  TABLE = 'table',
  CARD = 'card',
}

interface TableViewState {
  viewState: ViewState
  setViewState: (nextValue: ViewState) => void
}

export const useTableView = create<TableViewState>((set) => {
  const initialState: TableViewState = {
    viewState: ViewState.TABLE,
    setViewState: (nextValue) => set((state) => ({ ...state, viewState: nextValue })),
  }

  return initialState
})
