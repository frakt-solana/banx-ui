import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import produce from 'immer'
import { chain, maxBy } from 'lodash'
import { create } from 'zustand'

import { core, fetchTokenLenderLoans } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'

import { useTokenLenderLoansOptimistic } from './useTokenLenderLoansOptimistic'

interface HiddenCollateralMintsState {
  mints: string[]
  addMints: (mints: string[]) => void
}

const useHiddenCollateralMint = create<HiddenCollateralMintsState>((set) => ({
  mints: [],
  addMints: (mints) => {
    set(
      produce((state: HiddenCollateralMintsState) => {
        state.mints = mints.map((nft) => nft)
      }),
    )
  },
}))

export const useTokenLenderLoans = () => {
  const { publicKey } = useWallet()
  const walletPublicKeyString = publicKey?.toBase58() || ''

  const {
    loans: optimisticLoans,
    addLoans,
    findLoan,
    updateLoans,
  } = useTokenLenderLoansOptimistic()
  const { mints: hiddenLoansMints, addMints } = useHiddenCollateralMint()
  const { tokenType } = useNftTokenType()

  const { data: loans, isLoading } = useQuery(
    ['tokenLenderLoans', walletPublicKeyString, tokenType],
    () => fetchTokenLenderLoans({ walletPublicKey: walletPublicKeyString, tokenType }),
    {
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const walletOptimisticLoans = useMemo(() => {
    if (!walletPublicKeyString) return []
    return optimisticLoans.filter(({ wallet }) => wallet === walletPublicKeyString)
  }, [optimisticLoans, walletPublicKeyString])

  const mergedLoans = useMemo(() => {
    if (isLoading || !loans) {
      return []
    }

    return chain(loans)
      .concat(walletOptimisticLoans.map(({ loan }) => loan))
      .groupBy((loan) => loan.publicKey)
      .map((loans) => maxBy(loans, (loan) => loan.fraktBond.lastTransactedAt))
      .compact()
      .filter((loan) => !hiddenLoansMints.includes(loan.collateral.mint))
      .value()
  }, [loans, isLoading, walletOptimisticLoans, hiddenLoansMints])

  const updateOrAddLoan = (loan: core.TokenLoan) => {
    const loanExists = !!findLoan(loan.publicKey, walletPublicKeyString)
    return loanExists
      ? updateLoans(loan, walletPublicKeyString)
      : addLoans(loan, walletPublicKeyString)
  }

  return {
    loans: mergedLoans || [],
    loading: isLoading,
    updateOrAddLoan,
    addMints,
  }
}
