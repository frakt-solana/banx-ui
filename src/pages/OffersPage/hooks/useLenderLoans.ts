import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, maxBy } from 'lodash'

import { Loan, fetchLenderLoans } from '@banx/api/core'
import { useTokenType } from '@banx/store'

import { useHiddenNftsMints, useLenderLoansOptimistic } from '.'

export const USE_LENDER_LOANS_QUERY_KEY = 'lenderLoansV2'

export const useLenderLoans = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { mints: hiddenLoansMints, addMints } = useHiddenNftsMints()
  const { loans: optimisticLoans, addLoans, findLoan, updateLoans } = useLenderLoansOptimistic()

  const { data: loans, isLoading } = useQuery(
    [USE_LENDER_LOANS_QUERY_KEY, publicKeyString, tokenType],
    () => fetchLenderLoans({ walletPublicKey: publicKeyString, tokenType, getAll: true }),
    {
      enabled: !!publicKeyString,
      refetchOnWindowFocus: false,
      refetchInterval: 30 * 1000,
    },
  )

  const walletOptimisticLoans = useMemo(() => {
    if (!publicKeyString) return []
    return optimisticLoans.filter(({ wallet }) => wallet === publicKeyString)
  }, [optimisticLoans, publicKeyString])

  const mergedLoans = useMemo(() => {
    if (isLoading || !loans) {
      return []
    }

    return chain(loans)
      .concat(walletOptimisticLoans.map(({ loan }) => loan))
      .groupBy('publicKey')
      .map((loans) => maxBy(loans, ({ fraktBond }) => fraktBond.lastTransactedAt))
      .compact()
      .filter((loan) => !hiddenLoansMints.includes(loan.nft.mint))
      .value()
  }, [loans, isLoading, walletOptimisticLoans, hiddenLoansMints])

  const updateOrAddLoan = (loan: Loan) => {
    const loanExists = !!findLoan(loan.publicKey, publicKeyString)
    return loanExists ? updateLoans(loan, publicKeyString) : addLoans(loan, publicKeyString)
  }

  return {
    loans: mergedLoans || [],
    loading: isLoading,
    updateOrAddLoan,
    addMints,
  }
}
