import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

import { Loan, fetchWalletLoans } from '@banx/api/core'
import { useOptimisticLoans } from '@banx/store'

type UseWalletLoans = () => {
  loans: Loan[]
  isLoading: boolean
}

export const USE_WALLET_LOANS_QUERY_KEY = 'walletLoans'

export const useWalletLoans: UseWalletLoans = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { loans: optimisticLoans } = useOptimisticLoans()

  const { data, isLoading } = useQuery(
    [USE_WALLET_LOANS_QUERY_KEY, publicKeyString],
    () => fetchWalletLoans({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loans = useMemo(() => {
    if (!data) {
      return []
    }

    const optimisticLoansPubkeys = optimisticLoans.map(({ publicKey }) => publicKey)

    const dataFiltered = data.filter(({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey))

    return [...dataFiltered, ...optimisticLoans].filter(
      (loan) =>
        loan.bondTradeTransaction.bondTradeTransactionState !==
        BondTradeTransactionV2State.PerpetualRepaid,
    )
  }, [data, optimisticLoans])

  return {
    loans,
    isLoading,
  }
}
