import { useEffect } from 'react'

import { map, uniqBy } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { Offer } from '@banx/api/core'

const BANX_OFFERS_OPTIMISTICS_LS_KEY = '@banx.offersOptimistics'
const OFFERS_CACHE_TIME_UNIX = 15 * 60 //? 15 minutes

export interface OfferOptimistic {
  offer: Offer
  expiredAt: number
}

export interface OffersOptimisticStore {
  optimisticOffers: OfferOptimistic[]
  find: (publicKey: string) => OfferOptimistic | undefined
  add: (offers: Offer[]) => void
  remove: (publicKeys: string[]) => void
  update: (offers: Offer[]) => void
  setState: (optimisticOffers: OfferOptimistic[]) => void
}

const useOptimisticOffersStore = create<OffersOptimisticStore>((set, get) => ({
  optimisticOffers: [],
  add: (offers) =>
    set((state) => {
      const nextOffers = addOffers(
        state.optimisticOffers,
        map(offers, (offer) => convertOfferToOptimistic(offer)),
      )
      setOptimisticOffersLS(nextOffers)
      return { ...state, optimisticOffers: nextOffers }
    }),
  remove: (publicKeys) =>
    set((state) => {
      const nextOffers = removeOffers(state.optimisticOffers, publicKeys)
      setOptimisticOffersLS(nextOffers)
      return { ...state, optimisticOffers: nextOffers }
    }),
  find: (publicKey) => {
    const { optimisticOffers } = get()
    return findOffer(optimisticOffers, publicKey)
  },
  update: (offers: Offer[]) =>
    set((state) => {
      const nextOffers = updateOffers(
        state.optimisticOffers,
        map(offers, (offer) => convertOfferToOptimistic(offer)),
      )
      setOptimisticOffersLS(nextOffers)
      return { ...state, optimisticOffers: nextOffers }
    }),
  setState: (optimisticOffers) =>
    set((state) => {
      return { ...state, optimisticOffers }
    }),
}))

export const useOffersOptimistic = () => {
  const { optimisticOffers, add, remove, find, update, setState } = useOptimisticOffersStore()

  useEffect(() => {
    try {
      const optimisticOffers = getOptimisticOffersLS()
      setOptimisticOffersLS(optimisticOffers)
      setState(optimisticOffers)
    } catch (error) {
      console.error(error)
      setOptimisticOffersLS([])
      setState([])
    }
  }, [setState])

  return { optimisticOffers, add, remove, find, update }
}

export const isOptimisticOfferExpired = (loan: OfferOptimistic) => loan.expiredAt < moment().unix()

const setOptimisticOffersLS = (Offers: OfferOptimistic[]) => {
  localStorage.setItem(BANX_OFFERS_OPTIMISTICS_LS_KEY, JSON.stringify(Offers))
}

const convertOfferToOptimistic = (offer: Offer) => {
  return {
    offer,
    expiredAt: moment().unix() + OFFERS_CACHE_TIME_UNIX,
  }
}

const getOptimisticOffersLS = () => {
  const optimisticOffers = localStorage.getItem(BANX_OFFERS_OPTIMISTICS_LS_KEY)
  return (optimisticOffers ? JSON.parse(optimisticOffers) : []) as OfferOptimistic[]
}

const addOffers = (offersState: OfferOptimistic[], offersToAdd: OfferOptimistic[]) =>
  uniqBy([...offersState, ...offersToAdd], ({ offer }) => offer.publicKey)

const removeOffers = (offersState: OfferOptimistic[], offersPubkeysToRemove: string[]) =>
  offersState.filter(({ offer }) => !offersPubkeysToRemove.includes(offer.publicKey))

const findOffer = (offersState: OfferOptimistic[], offerPublicKey: string) =>
  offersState.find(({ offer }) => offer.publicKey === offerPublicKey)

const updateOffers = (offersState: OfferOptimistic[], offersToAddOrUpdate: OfferOptimistic[]) => {
  const publicKeys = offersToAddOrUpdate.map(({ offer }) => offer.publicKey)
  const sameOffersRemoved = removeOffers(offersState, publicKeys)
  return addOffers(sameOffersRemoved, offersToAddOrUpdate)
}

export const isOfferNewer = (offerA: Offer, offerB: Offer) =>
  offerA.lastTransactedAt >= offerB.lastTransactedAt
