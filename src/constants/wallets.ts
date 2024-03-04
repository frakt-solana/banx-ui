import { MagicEdenWalletAdapter } from '@solana/wallet-adapter-magiceden'

//? Add additional wallet adapters here
export const WALLETS = [new MagicEdenWalletAdapter()]

export const MAGIC_EDEN_WALLET_NAME = 'Magic Eden'
export const MAGIC_EDEN_DOWNLOAD_URL =
  'https://chromewebstore.google.com/detail/magic-eden-wallet/mkpegjkblkkefacfnmkajcjmabijhclg'
