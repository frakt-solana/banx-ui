import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { isEmpty, maxBy } from 'lodash'

import { core } from '@banx/api/nft'
import { useTokenType } from '@banx/store/common'
import { convertOffersToSimple } from '@banx/utils'

import { useCartState } from './useCartState'

export const useBorrowNftsQuery = (marketPubkey: string) => {
  const { tokenType } = useTokenType()
  const { publicKey: walletPublicKey } = useWallet()
  const walletPubkeyString = walletPublicKey?.toBase58() || ''

  const { setCart } = useCartState()

  const { data, isLoading } = useQuery(
    ['borrowNftsByMarket', tokenType, marketPubkey, walletPubkeyString],
    () =>
      core.fetchBorrowNftsAndOffers({
        walletPubkey: walletPubkeyString,
        tokenType,
        marketPublicKey: marketPubkey,
      }),
    {
      enabled: !!walletPublicKey && !!marketPubkey,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  const userVaults = useMemo(() => {
    return data?.userVaults || []
  }, [data])

  const rawOffers = useMemo(() => {
    if (isEmpty(data?.offers)) return []
    return data?.offers?.[marketPubkey] || []
  }, [data, marketPubkey])

  const simpleOffers = useMemo(() => {
    return convertOffersToSimple(rawOffers, userVaults, 'desc')
  }, [userVaults, rawOffers])

  //? Set offers in cartState
  useEffect(() => {
    if (!isEmpty(simpleOffers) && !isEmpty(userVaults)) {
      setCart({ offers: simpleOffers })
    } else {
      setCart({ offers: [] })
    }
  }, [setCart, simpleOffers, userVaults])

  const maxLoanValueOnMarket = useMemo(() => {
    const bestOffer = maxBy(simpleOffers, ({ loanValue }) => loanValue)
    return bestOffer?.loanValue || 0
  }, [simpleOffers])

  return {
    isLoading,
    nfts: data?.nfts || [],
    rawOffers,
    userVaults,
    maxLoanValueOnMarket,
  }
}
