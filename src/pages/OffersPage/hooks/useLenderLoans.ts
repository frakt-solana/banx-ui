import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'

import { Loan, fetchLenderLoans } from '@banx/api/core'

import { useHiddenNftsMints, useLenderLoansOptimistic } from '.'

export const USE_LENDER_LOANS_QUERY_KEY = 'lenderLoansV2'

export const useLenderLoans = () => {
  // const { publicKey } = useWallet()
  const { publicKey: publicKey2 } = useWallet()
  const publicKey = useMemo(
    () => new web3.PublicKey('mm8fDa7jiufFGD6h4foq9vdmTRxDeDSTKB9CZynwQQs'),
    [],
  )
  const publicKeyString = publicKey?.toBase58() || ''

  const { mints, addMints } = useHiddenNftsMints()

  const { loans: optimisticLoans, addLoans, findLoan, updateLoans } = useLenderLoansOptimistic()
  // const { optimisticOffers, remove: removeOffers, update: updateOrAddOffer } = useOffersOptimistic()

  const {
    data: loans,
    isLoading,
    isFetching,
    isFetched,
  } = useQuery(
    [USE_LENDER_LOANS_QUERY_KEY, publicKeyString],
    () => fetchLenderLoans({ walletPublicKey: publicKeyString, getAll: true }),
    {
      enabled: !!publicKeyString,
      refetchOnWindowFocus: false,
      refetchInterval: 30 * 1000,
    },
  )

  // const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useInfiniteQuery({
  //   queryKey: [USE_LENDER_LOANS_QUERY_KEY, publicKey],
  //   queryFn: ({ pageParam = 0 }) => fetchData(pageParam),
  //   getPreviousPageParam: (firstPage) => {
  //     return firstPage.pageParam - 1 ?? undefined
  //   },
  //   getNextPageParam: (lastPage) => {
  //     return lastPage.data?.length ? lastPage.pageParam + 1 : undefined
  //   },
  //   refetchOnWindowFocus: false,
  // })

  // const loans = useMemo(() => {
  //   return data?.pages?.map((page) => page.data).flat() || []
  // }, [data])

  // const { data, isLoading, isFetching, isFetched } = useQuery(
  //   [USE_LENDER_LOANS_QUERY_KEY, publicKeyString],
  //   () => fetchLenderLoansAndOffers({ walletPublicKey: publicKeyString }),
  //   {
  //     enabled: !!publicKeyString,
  //     refetchOnWindowFocus: false,
  //     refetchInterval: 30 * 1000,
  //   },
  // )

  // const walletOptimisticLoans = useMemo(() => {
  //   if (!publicKeyString) return []
  //   return optimisticLoans.filter(({ wallet }) => wallet === publicKeyString)
  // }, [optimisticLoans, publicKeyString])

  // //? Check same active loans (duplicated with BE) and purge them
  // useEffect(() => {
  //   if (!data || isFetching || !isFetched || !publicKeyString) return

  //   const expiredLoans = walletOptimisticLoans.filter((loan) =>
  //     isOptimisticLoanExpired(loan, publicKeyString),
  //   )

  //   const optimisticsToRemove = walletOptimisticLoans.filter(({ loan }) => {
  //     const sameLoanFromBE = (data?.nfts || []).find(
  //       ({ publicKey }) => publicKey === loan.publicKey,
  //     )
  //     if (!sameLoanFromBE) return false
  //     const isBELoanNewer = isLoanNewer(sameLoanFromBE, loan)
  //     return isBELoanNewer
  //   })

  //   if (optimisticsToRemove.length || expiredLoans.length) {
  //     removeOptimisticLoans(
  //       map([...expiredLoans, ...optimisticsToRemove], ({ loan }) => loan.publicKey),
  //       publicKeyString,
  //     )
  //   }
  // }, [data, isFetched, publicKeyString, walletOptimisticLoans, removeOptimisticLoans, isFetching])

  const updateOrAddLoan = (loan: Loan) => {
    const loanExists = !!findLoan(loan.publicKey, publicKeyString)
    return loanExists ? updateLoans(loan, publicKeyString) : addLoans(loan, publicKeyString)
  }

  return {
    loans: loans || [],
    loading: isLoading,
    updateOrAddLoan,
    // fetchNextPage,
    // isFetchingNextPage,
    // hasNextPage,
    addMints,
  }
}
