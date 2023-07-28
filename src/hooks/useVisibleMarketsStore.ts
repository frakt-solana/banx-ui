import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

type VisibleMarketsStore = {
  visibleCards: string[]
  toggleVisibleCard: (collectionName: string) => void
}

const useVisibleMarketsStore = create<VisibleMarketsStore>((set) => {
  return {
    visibleCards: [],
    toggleVisibleCard: (collectionName) =>
      set((state) => {
        const isVisible = state.visibleCards.includes(collectionName)
        const updatedCards = isVisible
          ? state.visibleCards.filter((name) => name !== collectionName)
          : [...state.visibleCards, collectionName]

        return { visibleCards: updatedCards }
      }),
  }
})

export const useVisibleMarketURLControl = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { visibleCards, toggleVisibleCard } = useVisibleMarketsStore()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    params.delete('opened')

    if (visibleCards.length > 0) {
      params.append('opened', visibleCards.join(','))
    }

    navigate({ search: params.toString() })
  }, [visibleCards, history])

  return { visibleCards, toggleVisibleCard }
}
