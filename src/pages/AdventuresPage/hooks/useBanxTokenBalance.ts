import { Connection } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'

import { getTokenBalance } from '@banx/pages/AdventuresPage/helpers'

export const useBanxTokenBalance = (connection: Connection, userPubKey: web3.PublicKey | null) => {
  const { data, isLoading } = useQuery(
    [userPubKey],
    () =>
      (userPubKey &&
        getTokenBalance(userPubKey, connection, new web3.PublicKey(BANX_TOKEN_MINT))) ||
      '0',
  )
  return {
    data: data || '0',
    isLoading,
  }
}
