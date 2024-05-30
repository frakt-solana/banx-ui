import { useEffect, useMemo } from 'react'

import { BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'
import { get, set } from 'idb-keyval'
import { filter, map, uniqBy } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { core } from '@banx/api/nft'
import { isSolTokenType } from '@banx/utils'

import { useNftTokenType } from '../nft'

const BANX_TOKEN_OFFERS_OPTIMISTICS_LS_KEY = '@banx.tokenOffersOptimistics'
const OFFERS_CACHE_TIME_UNIX = 2 * 60 //? Auto purge optimistic after 2 minutes

export interface TokenOfferOptimistic {
  offer: core.Offer
  expiredAt: number
}

export interface TokenOffersOptimisticStore {
  optimisticOffers: TokenOfferOptimistic[]
  find: (publicKey: string) => TokenOfferOptimistic | undefined
  add: (offers: core.Offer[]) => void
  remove: (publicKeys: string[]) => void
  update: (offers: core.Offer[]) => void
  setState: (optimisticOffers: TokenOfferOptimistic[]) => void
}

const useOptimisticOffersStore = create<TokenOffersOptimisticStore>((set, get) => ({
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
  update: (offers: core.Offer[]) =>
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

export const useTokenOffersOptimistic = () => {
  const { optimisticOffers, add, remove, find, update, setState } = useOptimisticOffersStore()

  const { tokenType } = useNftTokenType()

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

export const isOptimisticOfferExpired = (loan: TokenOfferOptimistic) =>
  loan.expiredAt < moment().unix()

const setOptimisticOffersIdb = async (offers: TokenOfferOptimistic[]) => {
  try {
    await set(BANX_TOKEN_OFFERS_OPTIMISTICS_LS_KEY, offers)
  } catch {
    return
  }
}

const convertOfferToOptimistic = (offer: core.Offer) => {
  return {
    offer,
    expiredAt: moment().unix() + OFFERS_CACHE_TIME_UNIX,
  }
}

const getOptimisticOffersIdb = async () => {
  try {
    return ((await get(BANX_TOKEN_OFFERS_OPTIMISTICS_LS_KEY)) || []) as TokenOfferOptimistic[]
  } catch {
    return []
  }
}

const addOffers = (offersState: TokenOfferOptimistic[], offersToAdd: TokenOfferOptimistic[]) =>
  uniqBy([...offersState, ...offersToAdd], ({ offer }) => offer.publicKey)

const removeOffers = (offersState: TokenOfferOptimistic[], offersPubkeysToRemove: string[]) =>
  offersState.filter(({ offer }) => !offersPubkeysToRemove.includes(offer.publicKey))

const findOffer = (offersState: TokenOfferOptimistic[], offerPublicKey: string) =>
  offersState.find(({ offer }) => offer.publicKey === offerPublicKey)

const updateOffers = (
  offersState: TokenOfferOptimistic[],
  offersToAddOrUpdate: TokenOfferOptimistic[],
) => {
  const publicKeys = offersToAddOrUpdate.map(({ offer }) => offer.publicKey)
  const sameOffersRemoved = removeOffers(offersState, publicKeys)
  return addOffers(sameOffersRemoved, offersToAddOrUpdate)
}

export const isOfferNewer = (offerA: core.Offer, offerB: core.Offer) =>
  offerA.lastTransactedAt >= offerB.lastTransactedAt
