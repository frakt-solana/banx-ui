import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react'

import { ConfigProps, DialectNoBlockchainSdk } from '@dialectlabs/react-sdk'
import {
  DialectSolanaSdk,
  DialectSolanaWalletAdapter,
  SolanaConfigProps,
} from '@dialectlabs/react-sdk-blockchain-solana'
import { WalletContextState, useWallet } from '@solana/wallet-adapter-react'

const solanaWalletToDialectWallet = (
  wallet: WalletContextState,
): DialectSolanaWalletAdapter | null => {
  if (!wallet.connected || wallet.connecting || wallet.disconnecting || !wallet.publicKey) {
    return null
  }

  return {
    publicKey: wallet.publicKey,
    signMessage: wallet.signMessage,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    diffieHellman: undefined,
  }
}

export const DialectProvider: FC<PropsWithChildren> = (props) => {
  const solanaWallet = useWallet()
  const [dialectSolanaWalletAdapter, setDialectSolanaWalletAdapter] =
    useState<DialectSolanaWalletAdapter | null>(null)

  // Basic Dialect-related configuration
  const dialectConfig: ConfigProps = useMemo(
    () => ({
      // general environment to target
      environment: 'production',
      dialectCloud: {
        // how to store/cache authorization token to make API calls
        tokenStore: 'local-storage',
      },
    }),
    [],
  )

  // Solana-specific configuration
  const solanaConfig: SolanaConfigProps = useMemo(
    () => ({
      wallet: dialectSolanaWalletAdapter,
      network: 'mainnet-beta',
    }),
    [dialectSolanaWalletAdapter],
  )

  useEffect(() => {
    // `solanaWalletToDialectWallet` is a function that needs to be implemented by you.
    // See "Converting your wallet for Dialect" section below.
    setDialectSolanaWalletAdapter(solanaWalletToDialectWallet(solanaWallet))
  }, [solanaWallet])

  // If our wallet has been initialized, then switch to Solana SDK provider
  if (dialectSolanaWalletAdapter) {
    return (
      <DialectSolanaSdk config={dialectConfig} solanaConfig={solanaConfig}>
        {props.children}
      </DialectSolanaSdk>
    )
  }

  return <DialectNoBlockchainSdk>{props.children}</DialectNoBlockchainSdk>
}

//? Check if wallet already signed a message to log in for dialect
export const getDialectAccessToken = (walletPubkey?: string): string | null => {
  if (!walletPubkey) return null
  try {
    const item = window.localStorage.getItem(`dialect-auth-token-${walletPubkey}`)
    return item ?? null
  } catch (error) {
    console.error(error)
    return null
  }
}
