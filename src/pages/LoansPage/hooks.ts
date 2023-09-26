import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { map } from 'lodash'
import moment from 'moment'

import { Loan, fetchWalletLoansAndOffers } from '@banx/api/core'
import { fetchUserLoansStats } from '@banx/api/stats'
import {
  isLoanNewer,
  isOptimisticLoanExpired,
  purgeLoansWithSameMintByFreshness,
  useLoansOptimistic,
} from '@banx/store'

import { SECONDS_IN_72_HOURS } from './constants'

type UseWalletLoans = () => {
  loans: Loan[]
  isLoading: boolean
}

export const USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY = 'walletLoansAndOffers'

export const useWalletLoansAndOffers: UseWalletLoans = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useLoansOptimistic()

  const { data, isLoading, isFetched, isFetching } = useQuery(
    [USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY, publicKeyString],
    () => fetchWalletLoansAndOffers({ walletPublicKey: publicKeyString }),
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
      const sameLoanFromBE = (data?.nfts || []).find(
        ({ publicKey }) => publicKey === loan.publicKey,
      )
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

    const dataFiltered = (data?.nfts || []).filter(
      ({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey),
    )

    const purgedSameMint = purgeLoansWithSameMintByFreshness(
      [...dataFiltered, ...map(walletOptimisticLoans, ({ loan }) => loan)],
      (loan) => loan,
    )

    const loans = purgedSameMint.filter(
      (loan) =>
        loan.bondTradeTransaction.bondTradeTransactionState !==
        BondTradeTransactionV2State.PerpetualRepaid,
    )

    return loans
  }, [data, walletOptimisticLoans])

  const filteredLiquidatedLoans = useMemo(() => {
    return loans.filter((loan) => {
      const { bondTradeTransaction, fraktBond } = loan

      const isTerminatingStatus =
        bondTradeTransaction.bondTradeTransactionState ===
        BondTradeTransactionV2State.PerpetualManualTerminating

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
    offers: data?.offers ?? {},
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
