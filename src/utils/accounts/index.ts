import { useEffect, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

const useNativeAccount = (): {
  account: web3.AccountInfo<Buffer> | null
} => {
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
    connection.onAccountChange(publicKey, (acc) => {
      if (acc) {
        setNativeAccount(acc)
      }
    })
  }, [wallet, publicKey, connection])

  return { account: nativeAccount }
}

export const useSolanaBalance = () => {
  const { account } = useNativeAccount()

  const balance = (account?.lamports || 0) / web3.LAMPORTS_PER_SOL

  return balance
}
