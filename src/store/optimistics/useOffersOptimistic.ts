import { useEffect, useMemo } from 'react'

import { BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'
import { get, set } from 'idb-keyval'
import { filter, map, uniqBy } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { Offer } from '@banx/api/core'
import { isSolTokenType } from '@banx/utils'

import { useTokenType } from '../useTokenType'

const BANX_OFFERS_OPTIMISTICS_LS_KEY = '@banx.offersOptimistics'
const OFFERS_CACHE_TIME_UNIX = 1 //? Auto purge optimistic after 1 second

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
      setOptimisticOffersIdb(nextOffers)
      return { ...state, optimisticOffers: nextOffers }
    }),
  remove: (publicKeys) =>
    set((state) => {
      const nextOffers = removeOffers(state.optimisticOffers, publicKeys)
      setOptimisticOffersIdb(nextOffers)
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
      setOptimisticOffersIdb(nextOffers)
      return { ...state, optimisticOffers: nextOffers }
    }),
  setState: (optimisticOffers) =>
    set((state) => {
      return { ...state, optimisticOffers }
    }),
}))

export const useOffersOptimistic = () => {
  const { optimisticOffers, add, remove, find, update, setState } = useOptimisticOffersStore()

  const { tokenType } = useTokenType()

  useEffect(() => {
    const setInitialState = async () => {
      try {
        const optimisticOffers = await getOptimisticOffersIdb()
        await setOptimisticOffersIdb(optimisticOffers)
        setState(optimisticOffers)
      } catch (error) {
        console.error(error)
        await setOptimisticOffersIdb([])
        setState([])
      }
    }
    setInitialState()
  }, [setState])

  const filteredOffersByTokenType = useMemo(() => {
    const bondingCurveType = isSolTokenType(tokenType)
      ? BondingCurveType.Linear
      : BondingCurveType.LinearUsdc

    return filter(
      optimisticOffers,
      ({ offer }) => offer.bondingCurve.bondingType === bondingCurveType,
    )
  }, [optimisticOffers, tokenType])

  return { optimisticOffers: filteredOffersByTokenType, add, remove, find, update }
}

export const isOptimisticOfferExpired = (loan: OfferOptimistic) => loan.expiredAt < moment().unix()

const setOptimisticOffersIdb = async (offers: OfferOptimistic[]) => {
  try {
    await set(BANX_OFFERS_OPTIMISTICS_LS_KEY, offers)
  } catch {
    return
  }
}

const convertOfferToOptimistic = (offer: Offer) => {
  return {
    offer,
    expiredAt: moment().unix() + OFFERS_CACHE_TIME_UNIX,
  }
}

const getOptimisticOffersIdb = async () => {
  try {
    return ((await get(BANX_OFFERS_OPTIMISTICS_LS_KEY)) || []) as OfferOptimistic[]
  } catch {
    return []
  }
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
