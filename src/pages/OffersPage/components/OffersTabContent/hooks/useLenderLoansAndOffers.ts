import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { chain, groupBy, maxBy } from 'lodash'
import { create } from 'zustand'

import { Loan, Offer, fetchLenderLoansAndOffersV2 } from '@banx/api/core'

interface HiddenNftsMintsState {
  mints: string[]
  addMints: (...mints: string[]) => void
}

export const useHiddenNftsMints = create<HiddenNftsMintsState>((set) => ({
  mints: [],
  addMints: (...mints) => {
    set(
      produce((state: HiddenNftsMintsState) => {
        state.mints.push(...mints)
      }),
    )
  },
}))

const convertLoanToOptimistic = (loan: Loan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
  }
}

export interface LoanOptimistic {
  loan: Loan
  wallet: string
}

interface OptimisticLenderLoansState {
  loans: LoanOptimistic[]
  addLoans: (loan: Loan, walletPublicKey: string) => void
  findLoans: (loanPubkey: string, walletPublicKey: string) => LoanOptimistic | null
  updateLoans: (loan: Loan, walletPublicKey: string) => void
}

const useLenderLoansOptimistic = create<OptimisticLenderLoansState>((set, get) => ({
  loans: [],
  addLoans: (loan, walletPublicKey) => {
    if (!walletPublicKey) return

    return set(
      produce((state: OptimisticLenderLoansState) => {
        state.loans.push(convertLoanToOptimistic(loan, walletPublicKey))
      }),
    )
  },
  findLoans: (loanPubkey, walletPublicKey) => {
    if (!walletPublicKey) return null

    return get().loans.find(({ loan }) => loan.publicKey === loanPubkey) ?? null
  },
  updateLoans: (loan, walletPublicKey) => {
    if (!walletPublicKey) return

    const loanExists = !!get().findLoans(loan.publicKey, walletPublicKey)

    loanExists &&
      set(
        produce((state: OptimisticLenderLoansState) => {
          state.loans = state.loans.map((existingLoan) =>
            existingLoan.loan.publicKey === loan.publicKey
              ? convertLoanToOptimistic(loan, walletPublicKey)
              : existingLoan,
          )
        }),
      )
  },
}))

interface OptimisticOffersState {
  offers: Offer[]
  addOffer: (offer: Offer) => void
  findOffer: (offerPubkey: string) => Offer | null
  updateOffer: (offer: Offer) => void
}

export const useOptimisticOffers = create<OptimisticOffersState>((set, get) => ({
  offers: [],
  addOffer: (offer) => {
    set(
      produce((state: OptimisticOffersState) => {
        state.offers.push(offer)
      }),
    )
  },
  findOffer: (offerPubkey) => {
    const { offers } = get()
    return offers.find(({ publicKey }) => publicKey === offerPubkey) ?? null
  },
  updateOffer: (offer: Offer) => {
    const { findOffer } = get()
    const offerExists = !!findOffer(offer.publicKey)

    offerExists &&
      set(
        produce((state: OptimisticOffersState) => {
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

  const { mints, addMints } = useHiddenNftsMints()

  const { loans: optimisticLoans, addLoans, findLoans, updateLoans } = useLenderLoansOptimistic()
  const { offers: optimisticOffers, findOffer, updateOffer, addOffer } = useOptimisticOffers()

  const { data, isLoading } = useQuery(
    ['lenderLoansAndOffers', publicKeyString],
    () => fetchLenderLoansAndOffersV2({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      refetchOnWindowFocus: false,
      refetchInterval: 30 * 1000,
    },
  )

  const walletOptimisticLoans = useMemo(() => {
    if (!publicKeyString) return []
    return optimisticLoans.filter(({ wallet }) => wallet === publicKeyString)
  }, [optimisticLoans, publicKeyString])

  const processedData = useMemo(() => {
    if (!data?.length) {
      return []
    }

    const newData = data.map((item) => {
      const combinedLoans = [...item.loans, ...walletOptimisticLoans.map(({ loan }) => loan)]

      const filteredLoans = chain(combinedLoans)
        .groupBy('publicKey')
        .map((offers) => maxBy(offers, 'fraktBond.lastTransactedAt'))
        .compact()
        .value()

      return {
        ...item,
        loans: filteredLoans.filter((loan) => !mints.includes(loan.nft.mint)),
      }
    })

    return newData
  }, [data, mints, walletOptimisticLoans])

  const updateOrAddLoan = (loan: Loan) => {
    const loanExists = !!findLoans(loan.publicKey, publicKeyString)
    return loanExists ? updateLoans(loan, publicKeyString) : addLoans(loan, publicKeyString)
  }

  const updateOrAddOffer = (offer: Offer) => {
    const loanExists = !!findOffer(offer.publicKey)
    return loanExists ? updateOffer(offer) : addOffer(offer)
  }

  return {
    data: processedData,
    offers: groupBy(processedData?.flatMap(({ offer }) => offer), 'publicKey') ?? {},
    loading: isLoading,
    optimisticOffers,
    updateOrAddOffer,
    updateOrAddLoan,
    addMints,
  }
}
