import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, isEmpty } from 'lodash'

import { core } from '@banx/api/nft'
import { useTokenType } from '@banx/store/common'
import { convertOffersToSimple } from '@banx/utils'

export const useListLoansBorrowNfts = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPubkeyString = walletPublicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['listLoansBorrowNfts', tokenType, walletPubkeyString],
    () =>
      core.fetchBorrowNftsAndOffers({
        walletPubkey: walletPubkeyString,
        tokenType,
      }),
    {
      enabled: !!walletPublicKey,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  const maxLoanValueByMarket: Record<string, number> = useMemo(() => {
    if (isEmpty(data?.offers)) return {}

    const simpleOffers = chain(data?.offers || {})
      .toPairs()
      .map(([marketPubkey, offers]) => {
        const simpleOffers = convertOffersToSimple(offers, data?.userVaults || [], 'desc')
        return [marketPubkey, simpleOffers]
      })
      .fromPairs()
      .value()

    return chain(simpleOffers)
      .keys()
      .map((hadoMarket) => {
        const price = simpleOffers[hadoMarket]?.[0]?.loanValue || 0
        return [hadoMarket, price]
      })
      .fromPairs()
      .value()
  }, [data])

  return {
    nfts: data?.nfts || [],
    isLoading,
    maxLoanValueByMarket,
  }
}
