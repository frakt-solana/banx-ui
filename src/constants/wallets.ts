import { MagicEdenWalletAdapter } from '@solana/wallet-adapter-magiceden'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'

//? Add additional wallet adapters here
export const WALLETS = [new MagicEdenWalletAdapter(), new SolflareWalletAdapter()]

export const MAGIC_EDEN_WALLET_NAME = 'Magic Eden'
export const MAGIC_EDEN_DOWNLOAD_URL =
  'https://chromewebstore.google.com/detail/magic-eden-wallet/mkpegjkblkkefacfnmkajcjmabijhclg'
