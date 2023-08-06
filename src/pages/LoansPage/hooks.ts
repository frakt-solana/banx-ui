import { useQuery } from '@tanstack/react-query'

import { Loan, fetchWalletLoans } from '@banx/api/loans'

type UseWalletLoans = (walletPublicKey: string) => {
  loans: Loan[]
  isLoading: boolean
}

export const useWalletLoans: UseWalletLoans = (walletPublicKey) => {
  const { data, isLoading } = useQuery(
    ['walletLoans', walletPublicKey],
    () => fetchWalletLoans({ walletPublicKey }),
    {
      enabled: !!walletPublicKey,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    loans: data || [],
    isLoading,
  }
}
