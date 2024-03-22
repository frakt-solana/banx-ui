import { web3 } from 'fbonds-core'
import { useQuery } from '@tanstack/react-query'
import { getTokenBalance } from '@banx/pages/AdventuresPage/helpers'
import { BANX_TOKEN } from '@banx/constants/banxNfts'
import { Connection } from '@solana/web3.js'

export const useBanxTokenBalance = (connection: Connection, userPubKey: web3.PublicKey | null) => {
  const {data, isLoading} = useQuery([userPubKey], () => userPubKey && getTokenBalance(userPubKey, connection, new web3.PublicKey(BANX_TOKEN)) || '0')
  return {
    data: data || '0',
    isLoading
  }
}
