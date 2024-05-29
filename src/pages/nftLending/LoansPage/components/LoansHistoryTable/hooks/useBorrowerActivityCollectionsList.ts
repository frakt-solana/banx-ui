import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { activity } from '@banx/api/nft'
import { useNftTokenType } from '@banx/store/nft'

export const useBorrowerActivityCollectionsList = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useNftTokenType()

  const { data, isLoading } = useQuery(
    ['borrowerActivityCollectionsList', publicKeyString, tokenType],
    () =>
      activity.fetchActivityCollectionsList({
        walletPubkey: publicKeyString,
        userType: 'borrower',
        tokenType,
      }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    data: data ?? [],
    isLoading,
  }
}