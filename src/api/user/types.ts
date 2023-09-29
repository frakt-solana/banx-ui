export interface DiscordUserInfoRaw {
  avatar: string
  discordId: string
  isOnServer: boolean
}

export interface DiscordUserInfo {
  avatarUrl: string | null
  isOnServer: boolean
}

export enum BanxNotificationType {
  LOAN = 'loan',
  DEPOSIT = 'deposit',
  LOT_TICKET = 'lotTicket',
  GRACE = 'grace',
}

export interface BanxNotification {
  id: string
  type: BanxNotificationType
  user: string
  message: {
    title: string
    body: string
  }
  image?: string
  isRead: boolean
  date: number
}

interface Rewards {
  user: string
  reward: number
}

export interface UserRewards {
  lenders: Rewards[]
  borrowers: Rewards[]
}
