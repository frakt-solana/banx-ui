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
