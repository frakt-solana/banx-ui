import { useEffect, useMemo } from 'react'

import { web3 } from 'fbonds-core'
import { getBondingCurveTypeFromLendingToken } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { get, set } from 'idb-keyval'
import { filter, map, uniqBy } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { coreNew } from '@banx/api/nft'

import { useTokenType } from './useTokenType'

//TODO Purge old key
// const BANX_OFFERS_OPTIMISTICS_LS_KEY_OLD = '@banx.offersOptimistics'
const BANX_OFFERS_OPTIMISTICS_LS_KEY = '@banx.offersOptimistics2'
const OFFERS_CACHE_TIME_UNIX = 2 * 60 //? Auto purge optimistic after 2 minutes

export interface OfferOptimistic {
  offer: coreNew.Offer
  expiredAt: number
}

export interface OffersOptimisticStore {
  optimisticOffers: OfferOptimistic[]
  find: (publicKey: web3.PublicKey) => OfferOptimistic | undefined
  add: (offers: coreNew.Offer[]) => void
  remove: (publicKeys: web3.PublicKey[]) => void
  update: (offers: coreNew.Offer[]) => void
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
  update: (offers: coreNew.Offer[]) =>
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
    const bondingCurveType = getBondingCurveTypeFromLendingToken(tokenType)

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

const convertOfferToOptimistic = (offer: coreNew.Offer) => {
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

const removeOffers = (offersState: OfferOptimistic[], offersPubkeysToRemove: web3.PublicKey[]) =>
  offersState.filter(
    ({ offer }) =>
      !offersPubkeysToRemove.map((p) => p.toBase58()).includes(offer.publicKey.toBase58()),
  )

const findOffer = (offersState: OfferOptimistic[], offerPublicKey: web3.PublicKey) =>
  offersState.find(({ offer }) => offer.publicKey.equals(offerPublicKey))

const updateOffers = (offersState: OfferOptimistic[], offersToAddOrUpdate: OfferOptimistic[]) => {
  const publicKeys = offersToAddOrUpdate.map(({ offer }) => offer.publicKey)
  const sameOffersRemoved = removeOffers(offersState, publicKeys)
  return addOffers(sameOffersRemoved, offersToAddOrUpdate)
}

export const isOfferNewer = (offerA: coreNew.Offer, offerB: coreNew.Offer) =>
  offerA.lastTransactedAt.gte(offerB.lastTransactedAt)
