import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { core } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'

export const USE_USER_TOKEN_LOAN_LISTINGS_QUERY_KEY = 'userTokenLoanListings'

export const useUserTokenLoanListings = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    [USE_USER_TOKEN_LOAN_LISTINGS_QUERY_KEY, walletPubkey, tokenType],
    () => core.fetchUserTokenLoansListings({ walletPubkey, tokenType }),
    {
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
      staleTime: 15 * 1000,
    },
  )

  return {
    loans: data ?? [],
    isLoading,
  }
}
