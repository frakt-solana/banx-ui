import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain } from 'lodash'
import { create } from 'zustand'

import { fetchTokenBalance } from '@banx/api/common'
import { core } from '@banx/api/tokens'
import { USDC_ADDRESS, WSOL_ADDRESS } from '@banx/constants'
import { useTokenType } from '@banx/store/common'
import { isBanxSolTokenType } from '@banx/utils'

import { BorrowTokenTabName } from './BorrowTokenPage'
import { BORROW_TOKENS_LIST } from './constants'

export const useCollateralsList = () => {
  const { publicKey } = useWallet()
  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['collateralsList', publicKey, tokenType],
    () => core.fetchCollateralsList({ walletPubkey: publicKey?.toBase58(), marketType: tokenType }),
    {
      refetchOnWindowFocus: false,
      refetchInterval: 10_000,
      staleTime: 10_000,
    },
  )

  const collateralsList = useMemo(() => {
    if (!data) return []

    const collateralMintToRemove = isBanxSolTokenType(tokenType) ? WSOL_ADDRESS : USDC_ADDRESS

    return chain(data)
      .filter((token) => token.collateral.mint !== collateralMintToRemove)
      .sortBy((token) => -calculateCollateralValueInUsd(token))
      .value()
  }, [data, tokenType])

  return { collateralsList, isLoading }
}

const calculateCollateralValueInUsd = (token: core.CollateralToken) => {
  const { collateral, amountInWallet, collateralPrice } = token
  return (amountInWallet / Math.pow(10, collateral.decimals)) * collateralPrice
}

export const useBorrowTokensList = () => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  const fetchSolBalance = async () => {
    if (!publicKey) return 0

    const accountInfo = await connection.getAccountInfo(publicKey)
    return accountInfo?.lamports || 0
  }

  const fetchTokenBalanceByMint = async (mintAddress: string) => {
    if (!publicKey) return 0

    const balanceBN = await fetchTokenBalance({
      tokenAddress: mintAddress,
      connection,
      publicKey,
    })

    return balanceBN.toNumber()
  }

  const fetchBorrowTokenList = async () => {
    if (!connection || !publicKey) return BORROW_TOKENS_LIST

    return await Promise.all(
      BORROW_TOKENS_LIST.map(async (token) => {
        const isSolToken = token.collateral.mint === WSOL_ADDRESS

        const amountInWallet = isSolToken
          ? await fetchSolBalance()
          : await fetchTokenBalanceByMint(token.collateral.mint)

        return { ...token, amountInWallet }
      }),
    )
  }
  const { data, isLoading } = useQuery(['borrowTokensList', publicKey], fetchBorrowTokenList, {
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  })

  return { borrowTokensList: data ?? [], isLoading }
}

type BorrowTokenTabsState = {
  tab: BorrowTokenTabName | null
  setTab: (tab: BorrowTokenTabName | null) => void
}

export const useBorrowTokenTabs = create<BorrowTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
