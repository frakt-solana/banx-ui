import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'

export const WALLETS = [new SolflareWalletAdapter(), new GlowWalletAdapter()]
