import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchTokenBalance } from '@banx/api/common'
import { core } from '@banx/api/tokens'
import { SOL_ADDRESS } from '@banx/constants'

import { BORROW_TOKENS_LIST } from '../../constants'

export const useCollateralsList = () => {
  const { publicKey: walletPubkey } = useWallet()

  const { data, isLoading } = useQuery(
    ['collateralsList', walletPubkey],
    () => core.fetchCollateralsList(walletPubkey?.toBase58()),
    {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  )

  const sortedCollateralsList = useMemo(() => {
    if (!data) return []

    return data.sort((a, b) => b.amountInWallet - a.amountInWallet)
  }, [data])

  return { collateralsList: sortedCollateralsList, isLoading }
}

export const useBorrowTokensList = () => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  const fetchBorrowTokenList = async () => {
    if (!connection || !publicKey?.toBase58()) {
      return BORROW_TOKENS_LIST
    }

    return await Promise.all(
      BORROW_TOKENS_LIST.map(async (token) => {
        if (token.collateral.mint === SOL_ADDRESS) {
          const account = await connection.getAccountInfo(publicKey)
          const amountInWallet = account?.lamports || 0

          return { ...token, amountInWallet }
        }

        const amountInWalletBN = await fetchTokenBalance({
          tokenAddress: token.collateral.mint,
          connection,
          publicKey,
        })

        const amountInWallet = amountInWalletBN?.toNumber() || 0

        return { ...token, amountInWallet }
      }),
    )
  }

  const { data, isLoading } = useQuery(['borrowTokensList', publicKey], fetchBorrowTokenList, {
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  })

  return { borrowTokensList: data ?? [], isLoading }
}
