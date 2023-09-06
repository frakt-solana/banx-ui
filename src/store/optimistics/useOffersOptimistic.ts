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

interface OffersOptimisticStore {
  optimisticOffers: OfferOptimistic[]
  setOffers: (...offers: OfferOptimistic[]) => void
}

const useOptimisticOffersStore = create<OffersOptimisticStore>((set) => ({
  optimisticOffers: [],
  setOffers: (...offers) => {
    set((state) => ({ ...state, optimisticOffers: offers }))
  },
}))

export interface UseOptimisticOffersValues {
  offers: OfferOptimistic[]
  find: (publicKey: string) => OfferOptimistic | undefined
  add: (offers: Offer[]) => void
  remove: (publicKeys: string[]) => void
  update: (offers: Offer[]) => void
}
export const useOptimisticOffers = (): UseOptimisticOffersValues => {
  const { optimisticOffers, setOffers: setOptimisticOffers } = useOptimisticOffersStore(
    (state: OffersOptimisticStore) => {
      try {
        const optimisticOffers = getOptimisticOffersLS()
        setOptimisticOffersLS(optimisticOffers)

        return {
          ...state,
          optimisticOffers,
        }
      } catch (error) {
        console.error(error)
        setOptimisticOffersLS([])

        return {
          ...state,
          optimisticOffers: [],
        }
      }
    },
  )

  const add: UseOptimisticOffersValues['add'] = (offers) => {
    const nextOffers = addOffers(
      optimisticOffers,
      map(offers, (offer) => convertOfferToOptimistic(offer)),
    )
    setOptimisticOffersLS(nextOffers)
    setOptimisticOffers(...nextOffers)
  }

  const remove: UseOptimisticOffersValues['remove'] = (publicKeys) => {
    const nextOffers = removeOffers(optimisticOffers, publicKeys)
    setOptimisticOffersLS(nextOffers)
    setOptimisticOffers(...nextOffers)
  }

  const find: UseOptimisticOffersValues['find'] = (publicKey) => {
    return findOffer(optimisticOffers, publicKey)
  }

  const update: UseOptimisticOffersValues['update'] = (offers: Offer[]) => {
    const nextOffers = updateOffers(
      optimisticOffers,
      map(offers, (offer) => convertOfferToOptimistic(offer)),
    )
    setOptimisticOffersLS(nextOffers)
    setOptimisticOffers(...nextOffers)
  }

  return { offers: optimisticOffers, add, remove, find, update }
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
