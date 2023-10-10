import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL } from '@banx/constants'
import { getDiscordAvatarUrl } from '@banx/utils'

import {
  BanxNotification,
  DiscordUserInfo,
  DiscordUserInfoRaw,
  LeaderboardData,
  LeaderboardDataSchema,
  SeasonUserRewards,
  SeasonUserRewardsSchema,
  UserRewards,
} from './types'

type FetchDiscordUser = (props: { publicKey: web3.PublicKey }) => Promise<DiscordUserInfo | null>
export const fetchDiscordUser: FetchDiscordUser = async ({ publicKey }) => {
  try {
    const { data } = await axios.get<DiscordUserInfoRaw>(
      `${BACKEND_BASE_URL}/discord/${publicKey.toBase58()}`,
    )

    if (!data) return null

    const avatarUrl = getDiscordAvatarUrl(data.discordId, data.avatar)

    if (!avatarUrl) return null

    const { data: avatarExists } = await axios.get<string>(avatarUrl)

    return {
      avatarUrl: avatarExists ? avatarUrl : null,
      isOnServer: data?.isOnServer ?? false,
    }
  } catch (error) {
    return {
      avatarUrl: null,
      isOnServer: false,
    }
  }
}

type RemoveDiscordUser = (props: { publicKey: web3.PublicKey }) => Promise<void>
export const removeDiscordUser: RemoveDiscordUser = async ({ publicKey }) => {
  try {
    await axios.get(`${BACKEND_BASE_URL}/discord/${publicKey.toBase58()}/delete`)
  } catch (error) {
    return
  }
}

type GetBanxUserNotifications = (props: {
  publicKey: web3.PublicKey
}) => Promise<ReadonlyArray<BanxNotification>>
export const getBanxUserNotifications: GetBanxUserNotifications = async ({ publicKey }) => {
  try {
    const { data } = await axios.get<{ data: ReadonlyArray<BanxNotification> }>(
      `${BACKEND_BASE_URL}/history/${publicKey.toBase58()}`,
    )

    return data?.data ?? []
  } catch (error) {
    return []
  }
}

type MarkBanxNotificationsAsRead = (props: {
  publicKey: web3.PublicKey
  notificationIds: string[]
}) => Promise<void>
export const markBanxNotificationsAsRead: MarkBanxNotificationsAsRead = async ({
  publicKey,
  notificationIds,
}) => {
  await axios.post(`${BACKEND_BASE_URL}/history/${publicKey.toBase58()}`, {
    ids: notificationIds,
  })
}

type DeleteBanxNotifications = (props: {
  publicKey: web3.PublicKey
  notificationIds: string[]
}) => Promise<void>
export const deleteBanxNotifications: DeleteBanxNotifications = async ({
  publicKey,
  notificationIds,
}) => {
  await axios.post(`${BACKEND_BASE_URL}/history/${publicKey.toBase58()}/delete`, {
    ids: notificationIds,
  })
}

// type GetBanxUserNotificationsSettings = (props: {
//   publicKey: web3.PublicKey
// }) => Promise<Record<string, boolean>>
// export const getBanxUserNotificationsSettings: GetBanxUserNotificationsSettings = async ({
//   publicKey,
// }) => {
//   const { data } = await axios.get<{ data: Record<string, boolean> }>(
//     `${BACKEND_BASE_URL}/settings/${publicKey.toBase58()}`,
//   )

//   return data?.data || {}
// }

// type SetBanxUserNotificationsSettings = (props: {
//   publicKey: web3.PublicKey
//   settings: Record<string, boolean>
// }) => Promise<void>
// export const setBanxUserNotificationsSettings: SetBanxUserNotificationsSettings = async ({
//   publicKey,
//   settings,
// }) => {
//   await axios.post(`${BACKEND_BASE_URL}/settings/${publicKey.toBase58()}`, settings)
// }

type BanxSignIn = (params: {
  publicKey: web3.PublicKey
  signature: string
}) => Promise<string | null>
export const banxSignIn: BanxSignIn = async ({ publicKey, signature }) => {
  const { data } = await axios.post<{ access_token: string }>(`${BACKEND_BASE_URL}/auth/sign-in`, {
    publicKey,
    signature,
  })

  return data?.access_token ?? null
}

//TODO Not implemented on BE yet. Use instead of manual expiration check of access token
type CheckBanxAccessToken = (token: string) => Promise<boolean>
export const checkBanxAccessToken: CheckBanxAccessToken = async (token) => {
  const { data } = await axios.post<{ token_valid: boolean }>(
    `${BACKEND_BASE_URL}/auth/validate-token`,
    {
      token,
    },
  )

  return data?.token_valid ?? false
}

type FetchUserRewards = (props: { publicKey: string }) => Promise<UserRewards>
export const fetchUserRewards: FetchUserRewards = async ({ publicKey }) => {
  const { data } = await axios.get<UserRewards>(`${BACKEND_BASE_URL}/stats/rewards/${publicKey}`)

  return data
}

type FetchSeasonUserRewards = (props: { walletPubkey: string }) => Promise<SeasonUserRewards | null>
export const fetchSeasonUserRewards: FetchSeasonUserRewards = async ({ walletPubkey }) => {
  try {
    const { data } = await axios.get<{ data: SeasonUserRewards }>(
      `${BACKEND_BASE_URL}/leaderboard/user-rewards/${walletPubkey}`,
    )

    try {
      await SeasonUserRewardsSchema.parseAsync(data?.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data?.data
  } catch (error) {
    return null
  }
}

type FetchLeaderboardData = (props: {
  walletPubkey: string
  order?: string
  skip: number
  limit: number
}) => Promise<LeaderboardData[]>
export const fetchLeaderboardData: FetchLeaderboardData = async ({
  walletPubkey,
  order = 'asc',
  skip,
  limit,
}) => {
  try {
    const { data } = await axios.get<{ data: LeaderboardData[] }>(
      `${BACKEND_BASE_URL}/leaderboard/${walletPubkey}?order=${order}&skip=${skip}&limit=${limit}`,
    )

    try {
      await LeaderboardDataSchema.array().parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data?.data
  } catch (error) {
    return []
  }
}
