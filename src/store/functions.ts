import { create } from 'zustand'

type CollectionsStore = {
  selectedCollections: string[]
  setSelectedCollections: (collections: string[]) => void
}

export const createCollectionsStore = () => {
  return create<CollectionsStore>((set) => ({
    selectedCollections: [],
    setSelectedCollections: (collections) => set({ selectedCollections: collections }),
  }))
}
