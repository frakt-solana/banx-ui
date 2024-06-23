import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { BONDS, USDC_ADDRESS } from '@banx/constants'
import { isBanxSolTokenType, isSolTokenType, isUsdcTokenType } from '@banx/utils'

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

type Options = {
  isLive?: boolean
}

type UseTokenBalance = (options?: Options) => number

const useSolanaBalance: UseTokenBalance = (options) => {
  const { isLive = false } = options || {}

  const account = useNativeAccount({ isLive })

  const balance = account?.lamports || 0
  return balance
}

const useUsdcBalance: UseTokenBalance = (options) => {
  const { isLive = false } = options || {}

  return useTokenBalance(USDC_ADDRESS, { isLive })
}

const useTokenBalance = (tokenAddress: string, options?: Options) => {
  const { isLive = false } = options || {}

  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const { data: tokenBalance } = useQuery(
    ['tokenBalance', publicKey, tokenAddress],
    async () => {
      if (connection && publicKey && tokenAddress) {
        const tokenPublicKey = new web3.PublicKey(tokenAddress)
        const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
          programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
          mint: tokenPublicKey,
        })

        const userTokenAccountAddress = tokenAccounts.value[0]?.pubkey
        const balance = await connection.getTokenAccountBalance(userTokenAccountAddress)
        return parseFloat(balance.value.amount)
      }
      return null
    },
    {
      enabled: Boolean(connection && publicKey && tokenAddress),
      refetchInterval: isLive ? 10000 : false,
    },
  )

  return tokenBalance || 0
}

export const useWalletBalance = (tokenType: LendingTokenType, options?: Options) => {
  const { isLive = false } = options || {}

  const usdcBalance = useUsdcBalance({ isLive })
  const solanaBalance = useSolanaBalance({ isLive })

  if (isSolTokenType(tokenType) || isBanxSolTokenType(tokenType)) {
    return solanaBalance
  }

  if (isUsdcTokenType(tokenType)) {
    return usdcBalance
  }

  throw new Error(`Unsupported token type: ${tokenType}`)
}
