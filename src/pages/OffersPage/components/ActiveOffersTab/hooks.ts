import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { first, groupBy, map, sumBy } from 'lodash'
import { create } from 'zustand'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Offer, fetchLenderLoansAndOffers } from '@banx/api/core'

import { DEFAULT_SORT_OPTION } from './constants'

interface HiddenNftsAndOffersState {
  mints: string[]
  addMints: (...mints: string[]) => void

  offers: Offer[]
  addOffer: (offer: Offer) => void
  findOffer: (offerPubkey: string) => Offer | null
  removeOffer: (offer: Offer) => void
  updateOffer: (offer: Offer) => void
}

export const useHiddenNftsAndOffers = create<HiddenNftsAndOffersState>((set, get) => ({
  mints: [],
  offers: [],
  addMints: (...mints) => {
    set(
      produce((state: HiddenNftsAndOffersState) => {
        state.mints.push(...mints)
      }),
    )
  },
  addOffer: (offer) => {
    set(
      produce((state: HiddenNftsAndOffersState) => {
        state.offers.push(offer)
      }),
    )
  },
  findOffer: (offerPubkey) => {
    const { offers } = get()
    return offers.find(({ publicKey }) => publicKey === offerPubkey) ?? null
  },
  removeOffer: (offer) => {
    set(
      produce((state: HiddenNftsAndOffersState) => {
        state.offers = state.offers.filter(({ publicKey }) => publicKey !== offer.publicKey)
      }),
    )
  },
  updateOffer: (offer: Offer) => {
    const { findOffer } = get()
    const offerExists = !!findOffer(offer.publicKey)

    offerExists &&
      set(
        produce((state: HiddenNftsAndOffersState) => {
          state.offers = state.offers.map((existingOffer) =>
            existingOffer.publicKey === offer.publicKey ? offer : existingOffer,
          )
        }),
      )
  },
}))

export const useLenderLoansAndOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { mints } = useHiddenNftsAndOffers()

  const { data, isLoading } = useQuery(
    ['lenderLoans', publicKeyString],
    () => fetchLenderLoansAndOffers({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loans = useMemo(() => {
    if (!data?.nfts) {
      return []
    }
    return data.nfts.filter(({ nft }) => !mints.includes(nft.mint))
  }, [data, mints])

  return {
    loans,
    offers: data?.offers ?? {},
    loading: isLoading,
  }
}

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
}

export const useActiveOffersTab = () => {
  const { loans, loading } = useLenderLoansAndOffers()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const taken = sumBy(groupedLoan, (nft) => nft.bondTradeTransaction.solAmount)

      return { collectionName, collectionImage, taken }
    })
  }, [loans])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'taken',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions,
    labels: ['Collection', 'Taken'],
    onChange: setSelectedOptions,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
  }

  return {
    loans,
    loading,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
