import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { map } from 'lodash'

import { Loan, fetchWalletLoans } from '@banx/api/core'
import { fetchUserLoansStats } from '@banx/api/stats'
import { isLoanNewer, isOptimisticLoanExpired, useOptimisticLoans } from '@banx/store'

type UseWalletLoans = () => {
  loans: Loan[]
  isLoading: boolean
}

export const USE_WALLET_LOANS_QUERY_KEY = 'walletLoans'

export const useWalletLoans: UseWalletLoans = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useOptimisticLoans()

  const { data, isLoading, isFetched, isFetching } = useQuery(
    [USE_WALLET_LOANS_QUERY_KEY, publicKeyString],
    () => fetchWalletLoans({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const walletOptimisticLoans = useMemo(() => {
    if (!publicKey) return []
    return optimisticLoans.filter(({ wallet }) => wallet === publicKey?.toBase58())
  }, [optimisticLoans, publicKey])

  //? Check same active loans (duplicated with BE) and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !publicKey) return

    const expiredLoans = walletOptimisticLoans.filter((loan) =>
      isOptimisticLoanExpired(loan, publicKey.toBase58()),
    )

    const optimisticsToRemove = walletOptimisticLoans.filter(({ loan }) => {
      const sameLoanFromBE = data.find(({ publicKey }) => publicKey === loan.publicKey)
      if (!sameLoanFromBE) return false
      const isBELoanNewer = isLoanNewer(sameLoanFromBE, loan)
      return isBELoanNewer
    })

    if (optimisticsToRemove.length || expiredLoans.length) {
      removeOptimisticLoans(
        map([...expiredLoans, ...optimisticsToRemove], ({ loan }) => loan.publicKey),
        publicKey.toBase58(),
      )
    }
  }, [data, isFetched, publicKey, walletOptimisticLoans, removeOptimisticLoans, isFetching])

  const loans = useMemo(() => {
    if (!data) {
      return []
    }

    const optimisticLoansPubkeys = walletOptimisticLoans.map(({ loan }) => loan.publicKey)

    const dataFiltered = data.filter(({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey))

    return [...dataFiltered, ...map(walletOptimisticLoans, ({ loan }) => loan)].filter(
      (loan) =>
        loan.bondTradeTransaction.bondTradeTransactionState !==
        BondTradeTransactionV2State.PerpetualRepaid,
    )
  }, [data, walletOptimisticLoans])

  return {
    loans,
    isLoading,
  }
}

export const useUserLoansStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['userLoansStats', publicKeyString],
    () => fetchUserLoansStats(publicKeyString),
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
