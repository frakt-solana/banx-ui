import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, map, maxBy } from 'lodash'
import { create } from 'zustand'

import { AssetType, stats } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import { isLoanNewer, isOptimisticLoanExpired, useTokenLoansOptimistic } from '@banx/store/token'
import { isTokenLoanLiquidated, isTokenLoanRepaid } from '@banx/utils'

import { TokenLoansTabsName } from './LoansTokenPage'

export const USE_WALLET_TOKEN_LOANS_AND_OFFERS_QUERY_KEY = 'walletTokenLoansAndOffers'

export const useWalletTokenLoans = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const publicKeyString = walletPublicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

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

    const nonOptimisticLoans = (data?.loans || []).filter(
      ({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey),
    )
    const combinedActiveLoans = [
      ...nonOptimisticLoans,
      ...walletOptimisticLoans.map(({ loan }) => loan),
    ]

    //? Filter out repaid loans and liquidated loans
    return chain(combinedActiveLoans)
      .groupBy((loan) => loan.publicKey)
      .map((groupedLoans) => maxBy(groupedLoans, (loan) => loan.fraktBond.lastTransactedAt))
      .compact()
      .filter((loan) => !isTokenLoanRepaid(loan))
      .filter((loan) => !isTokenLoanLiquidated(loan))
      .value()
  }, [data, walletOptimisticLoans])

  return {
    loans,
    isLoading,
  }
}

type LoansTokenTabsState = {
  tab: TokenLoansTabsName | null
  setTab: (tab: TokenLoansTabsName | null) => void
}

export const useTokenLoansTabs = create<LoansTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))

export const useUserTokenLoansStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['userLoansStats', publicKeyString, tokenType],
    () =>
      stats.fetchUserLoansStats({
        walletPubkey: publicKeyString,
        marketType: tokenType,
        tokenType: AssetType.SPL,
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
