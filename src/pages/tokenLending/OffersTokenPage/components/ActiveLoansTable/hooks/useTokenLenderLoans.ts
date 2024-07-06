import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import produce from 'immer'
import { chain, maxBy } from 'lodash'
import { create } from 'zustand'

import { core, fetchTokenLenderLoans } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'

import { useTokenLenderLoansOptimistic } from './useTokenLenderLoansOptimistic'

interface HiddenLoansPubkeysState {
  pubkeys: string[]
  addLoansPubkeys: (pubkeys: string[]) => void
}

const useHiddenLoansPubkeys = create<HiddenLoansPubkeysState>((set) => ({
  pubkeys: [],
  addLoansPubkeys: (pubkeys) => {
    set(
      produce((state: HiddenLoansPubkeysState) => {
        state.pubkeys = pubkeys.map((pubkey) => pubkey)
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
  const { pubkeys: hiddenLoansPubkeys, addLoansPubkeys } = useHiddenLoansPubkeys()
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
      .filter((loan) => !hiddenLoansPubkeys.includes(loan.publicKey))
      .value()
  }, [loans, isLoading, walletOptimisticLoans, hiddenLoansPubkeys])

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
    addLoansPubkeys,
  }
}
