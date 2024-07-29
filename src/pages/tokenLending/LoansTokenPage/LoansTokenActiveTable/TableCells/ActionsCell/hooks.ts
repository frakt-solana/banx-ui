import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { core } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { useTokenOffersOptimistic } from '@banx/store/token'
import { getTokenLoanSupply, stringToHex } from '@banx/utils'

export const useRefinanceTokenOffer = (loan: core.TokenLoan) => {
  const { publicKey } = useWallet()
  const walletPubkeyString = publicKey?.toString() || ''

  const { update: updateOrAddOffer } = useTokenOffersOptimistic()

  const { tokenType } = useNftTokenType()

  const tokenSupply = getTokenLoanSupply(loan)
  const hexAmount = stringToHex(String(tokenSupply), loan.collateral.decimals)

  const { data, isLoading } = useQuery(
    ['refinanceTokenOffer', { loan, walletPubkeyString }],
    () =>
      core.fetchBorrowSplTokenOffers({
        market: loan?.fraktBond.hadoMarket ?? '',
        outputToken: tokenType,
        type: 'input',
        amount: hexAmount,
        walletPubkey: walletPubkeyString,
      }),
    {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      enabled: !!loan.publicKey,
    },
  )

  //TODO (TokenLending): BE should return only one best offer instead of offers array
  const bestOffer = data?.[0]

  return {
    offer: bestOffer,
    updateOrAddOffer,
    isLoading,
  }
}
