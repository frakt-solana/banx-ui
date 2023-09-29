import { DISCORD_AVATARS_URL } from '@banx/constants'

export const getDiscordAvatarUrl = (discordId = '', hash = ''): string | null =>
  discordId && hash ? `${DISCORD_AVATARS_URL}/${discordId}/${hash}.png` : null
