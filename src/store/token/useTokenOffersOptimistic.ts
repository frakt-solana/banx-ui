import { useEffect, useMemo } from 'react'

import { getBondingCurveTypeFromLendingToken } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import { get, set } from 'idb-keyval'
import { filter, map, uniqBy } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'

import { useTokenType } from '../common'

const BANX_TOKEN_OFFERS_OPTIMISTICS_LS_KEY = '@banx.tokenOffersOptimistics'
const OFFERS_CACHE_TIME_UNIX = 2 * 60 //? Auto purge optimistic after 2 minutes

export interface TokenOfferOptimistic {
  offer: BondOfferV3
  expiredAt: number
}

export interface DBOfferOptimistic {
  offer: core.DBOffer
  expiredAt: number
}

export interface TokenOffersOptimisticStore {
  optimisticOffers: TokenOfferOptimistic[]
  find: (publicKey: string) => TokenOfferOptimistic | undefined
  add: (offers: BondOfferV3[]) => void
  remove: (publicKeys: string[]) => void
  update: (offers: BondOfferV3[]) => void
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
  update: (offers: BondOfferV3[]) =>
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

export const isOptimisticOfferExpired = (loan: TokenOfferOptimistic) =>
  loan.expiredAt < moment().unix()

const setOptimisticOffersIdb = async (offers: TokenOfferOptimistic[]) => {
  try {
    const convertedOffers = map(offers, (offer) => {
      return {
        offer: core.convertBondOfferV3ToDBOffer(offer.offer),
        expiredAt: offer.expiredAt,
      }
    })

    await set(BANX_TOKEN_OFFERS_OPTIMISTICS_LS_KEY, convertedOffers)
  } catch {
    return
  }
}

const convertOfferToOptimistic = (offer: BondOfferV3) => {
  return {
    offer,
    expiredAt: moment().unix() + OFFERS_CACHE_TIME_UNIX,
  }
}

const getOptimisticOffersIdb = async () => {
  try {
    const offers = (await get(BANX_TOKEN_OFFERS_OPTIMISTICS_LS_KEY)) as DBOfferOptimistic[]

    const convertedOffers = map(offers, (offer) => {
      return {
        offer: core.convertDBOfferToBondOfferV3(offer.offer),
        expiredAt: offer.expiredAt,
      }
    })

    return convertedOffers
  } catch {
    return []
  }
}

const addOffers = (offersState: TokenOfferOptimistic[], offersToAdd: TokenOfferOptimistic[]) =>
  uniqBy([...offersState, ...offersToAdd], ({ offer }) => offer.publicKey)

const removeOffers = (offersState: TokenOfferOptimistic[], offersPubkeysToRemove: string[]) =>
  offersState.filter(({ offer }) => !offersPubkeysToRemove.includes(offer.publicKey.toBase58()))

const findOffer = (offersState: TokenOfferOptimistic[], offerPublicKey: string) =>
  offersState.find(({ offer }) => offer.publicKey?.toBase58() === offerPublicKey)

const updateOffers = (
  offersState: TokenOfferOptimistic[],
  offersToAddOrUpdate: TokenOfferOptimistic[],
) => {
  const publicKeys = offersToAddOrUpdate
    .map(({ offer }) => offer.publicKey)
    .map((pk) => pk?.toBase58())

  const sameOffersRemoved = removeOffers(offersState, publicKeys)
  return addOffers(sameOffersRemoved, offersToAddOrUpdate)
}

export const isOfferNewer = (offerA: BondOfferV3, offerB: BondOfferV3) =>
  offerA.lastTransactedAt.gte(offerB.lastTransactedAt)
