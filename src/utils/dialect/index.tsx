import { useState, useMemo, useEffect, FC, PropsWithChildren } from 'react'
import { ConfigProps, DialectNoBlockchainSdk } from '@dialectlabs/react-sdk'
import {
  DialectSolanaWalletAdapter,
  SolanaConfigProps,
  DialectSolanaSdk,
} from '@dialectlabs/react-sdk-blockchain-solana'
import { WalletContextState, useWallet } from '@solana/wallet-adapter-react'

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
