import { WalletContextState } from '@solana/wallet-adapter-react'

import { trackWalletNameOnBorrow } from '@banx/api/user'
import { BACKEND_BASE_URL, DISCORD, DISCORD_AVATARS_URL } from '@banx/constants'

export const getDiscordAvatarUrl = (discordId = '', hash = ''): string | null =>
  discordId && hash ? `${DISCORD_AVATARS_URL}/${discordId}/${hash}.png` : null

export const getDiscordUri = (walletPubkey: string): string => {
  const redirectUri = `${BACKEND_BASE_URL}/discord`

  return `https://discord.com/api/oauth2/authorize?client_id=${
    DISCORD.CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=code&scope=identify&state=${walletPubkey}`
}

type IdentifyWalletNameOnBorrow = (props: {
  walletContext: WalletContextState
  fraktBondPubkeys: string[]
}) => Promise<void>
export const identifyWalletNameOnBorrow: IdentifyWalletNameOnBorrow = async ({
  walletContext,
  fraktBondPubkeys,
}) => {
  try {
    const { publicKey, wallet } = walletContext

    if (!publicKey || !wallet || !fraktBondPubkeys.length) return

    await trackWalletNameOnBorrow({
      walletName: wallet.adapter.name,
      fraktBondPubkeys: fraktBondPubkeys,
    })
  } catch (error) {
    console.error('Wallet identification error', error)
  }
}
