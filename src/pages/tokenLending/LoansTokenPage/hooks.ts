import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { map } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { stats } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import { useNftTokenType } from '@banx/store/nft'
import { isLoanNewer, isOptimisticLoanExpired, useTokenLoansOptimistic } from '@banx/store/token'
import { isTokenLoanRepaid, isTokenLoanTerminating } from '@banx/utils'

import { LoansTokenTabsName } from './LoansTokenPage'

export const USE_WALLET_TOKEN_LOANS_AND_OFFERS_QUERY_KEY = 'walletTokenLoansAndOffers'

export const useWalletTokenLoansAndOffers = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const publicKeyString = walletPublicKey?.toBase58() || ''

  const { tokenType } = useNftTokenType()

  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useTokenLoansOptimistic()

  const { data, isLoading, isFetched, isFetching } = useQuery(
    [USE_WALLET_TOKEN_LOANS_AND_OFFERS_QUERY_KEY, publicKeyString, tokenType],
    () => core.fetchWalletTokenLoansAndOffers({ walletPublicKey: publicKeyString, tokenType }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 5 * 60 * 1000, //? 5 minutes
    },
  )

  const walletOptimisticLoans = useMemo(() => {
    if (!publicKeyString) return []
    return optimisticLoans.filter(({ wallet }) => wallet === publicKeyString)
  }, [optimisticLoans, publicKeyString])

  //? Check same active loans (duplicated with BE) and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !publicKeyString) return

    const expiredLoans = walletOptimisticLoans.filter((loan) =>
      isOptimisticLoanExpired(loan, publicKeyString),
    )

    const optimisticsToRemove = walletOptimisticLoans.filter(({ loan }) => {
      const sameLoanFromBE = (data?.loans || []).find(
        ({ publicKey }) => publicKey === loan.publicKey,
      )
      if (!sameLoanFromBE) return false
      const isBELoanNewer = isLoanNewer(sameLoanFromBE, loan)
      return isBELoanNewer
    })

    if (optimisticsToRemove.length || expiredLoans.length) {
      removeOptimisticLoans(
        map([...expiredLoans, ...optimisticsToRemove], ({ loan }) => loan.publicKey),
        publicKeyString,
      )
    }
  }, [data, isFetched, publicKeyString, walletOptimisticLoans, removeOptimisticLoans, isFetching])

  const loans = useMemo(() => {
    if (!data) {
      return []
    }

    const optimisticLoansPubkeys = walletOptimisticLoans.map(({ loan }) => loan.publicKey)

    const dataFiltered = (data?.loans || []).filter(
      ({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey),
    )

    //TODO: Should we add filter same pubkeys by freshness?
    const combinedLoans = [...dataFiltered, ...map(walletOptimisticLoans, ({ loan }) => loan)]
    const loans = combinedLoans.filter((loan) => !isTokenLoanRepaid(loan))

    return loans
  }, [data, walletOptimisticLoans])

  const filteredLiquidatedLoans = useMemo(() => {
    return loans.filter((loan) => {
      const { fraktBond } = loan

      const isTerminatingStatus = isTokenLoanTerminating(loan)

      if (isTerminatingStatus) {
        const currentTimeInSeconds = moment().unix()
        const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
        return currentTimeInSeconds < expiredAt
      }

      return loan
    })
  }, [loans])

  return {
    loans: filteredLiquidatedLoans,
    isLoading,
  }
}

type LoansTokenTabsState = {
  tab: LoansTokenTabsName | null
  setTab: (tab: LoansTokenTabsName | null) => void
}

export const useLoansTokenTabs = create<LoansTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))

export const useUserTokenLoansStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useNftTokenType()

  const { data, isLoading } = useQuery(
    ['userLoansStats', publicKeyString, tokenType],
    () =>
      stats.fetchUserLoansStats({
        walletPubkey: publicKeyString,
        marketType: tokenType,
        tokenType: 'spl',
      }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    data,
    isLoading,
  }
}
