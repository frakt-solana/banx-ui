import { useEffect, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

type UseNativeAccount = (isLive: boolean) => web3.AccountInfo<Buffer> | null
const useNativeAccount: UseNativeAccount = (isLive) => {
  const { connection } = useConnection()
  const { wallet, publicKey } = useWallet()

  const [nativeAccount, setNativeAccount] = useState<web3.AccountInfo<Buffer> | null>(null)

  useEffect(() => {
    if (!connection || !publicKey) {
      return
    }

    connection.getAccountInfo(publicKey).then((acc) => {
      if (acc) {
        setNativeAccount(acc)
      }
    })

    if (isLive) {
      connection.onAccountChange(publicKey, (acc) => {
        if (acc) {
          setNativeAccount(acc)
        }
      })
    }
  }, [wallet, publicKey, connection, isLive])

  return nativeAccount
}

export const useSolanaBalance = (isLive = true) => {
  const account = useNativeAccount(isLive)

  const balance = (account?.lamports || 0) / web3.LAMPORTS_PER_SOL

  return balance
}
