import produce from 'immer'
import { uniqBy } from 'lodash'
import { create } from 'zustand'

import { Offer } from '@banx/api/core'

interface OffersOptimisticStore {
  offers: Offer[]
  find: (publicKey: string) => Offer | undefined
  add: (...offers: Offer[]) => void
  remove: (...publicKeys: string[]) => void
  update: (...offers: Offer[]) => void
}

export const useOffersOptimistic = create<OffersOptimisticStore>((set, get) => ({
  offers: [],
  find: (publicKey) => {
    return get().offers.find((offer) => offer.publicKey === publicKey)
  },
  add: (...offers) => {
    set(
      produce((state: OffersOptimisticStore) => {
        state.offers = uniqBy([...state.offers, ...offers], ({ publicKey }) => publicKey)
      }),
    )
  },
  remove: (...publicKeys) => {
    set(
      produce((state: OffersOptimisticStore) => {
        state.offers.filter(({ publicKey }) => !publicKeys.includes(publicKey))
      }),
    )
  },
  update: (...offers) => {
    const { add, remove } = get()
    const publicKeys = offers.map(({ publicKey }) => publicKey)
    remove(...publicKeys)
    add(...offers)
  },
}))
