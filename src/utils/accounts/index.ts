import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BONDS } from '@banx/constants'

type UseNativeAccount = ({ isLive }: { isLive?: boolean }) => web3.AccountInfo<Buffer> | null

const useNativeAccount: UseNativeAccount = ({ isLive = true }) => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const { data: nativeAccount = null } = useQuery(
    ['nativeAccount', publicKey],
    async () => {
      if (connection && publicKey) {
        const acc = await connection.getAccountInfo(publicKey)
        return acc || null
      }
      return null
    },
    {
      enabled: Boolean(connection && publicKey),
      refetchInterval: isLive ? 10000 : false,
    },
  )

  return nativeAccount
}

type UseSolanaBalance = (options?: { isLive?: boolean }) => number
export const useSolanaBalance: UseSolanaBalance = ({ isLive = true } = {}) => {
  const account = useNativeAccount({ isLive })

  const balance = (account?.lamports || 0) / web3.LAMPORTS_PER_SOL

  return balance
}

export const calculatePriorityFees = async (connection: web3.Connection): Promise<number> => {
  try {
    const response = await axios.post(connection.rpcEndpoint, {
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getPriorityFeeEstimate',
      params: [
        {
          accountKeys: [BONDS.PROGRAM_PUBKEY],
          options: {
            includeAllPriorityFeeLevels: true,
          },
        },
      ],
    })

    const { result } = response.data
    return result.priorityFeeLevels.veryHigh
  } catch (error) {
    console.error('Error calculating priority fees:', error)
    throw error
  }
}

export const usePriorityFees = () => {
  const { connection } = useConnection()

  const { data: priorityFees } = useQuery(
    ['priorityFees'],
    () => calculatePriorityFees(connection),
    {
      refetchInterval: 5000,
      cacheTime: 5000,
    },
  )

  return priorityFees || 0
}
