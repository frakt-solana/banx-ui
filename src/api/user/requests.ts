import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL } from '@banx/constants'
import { MutationResponse } from '@banx/types'
import { getDiscordAvatarUrl } from '@banx/utils'

import {
  BanxNotification,
  BonkWithdrawal,
  BonkWithdrawalSchema,
  DiscordUserInfo,
  DiscordUserInfoRaw,
  LeaderboardData,
  LeaderboardDataSchema,
  LeaderboardTimeRange,
  LinkedWallet,
  SeasonUserRewards,
  SeasonUserRewardsSchema,
  UserLockedRewards,
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

type CheckBanxJwt = (jwt: string) => Promise<boolean>
export const checkBanxJwt: CheckBanxJwt = async (jwt) => {
  try {
    const { data } = await axios.get<{ wallet: string }>(`${BACKEND_BASE_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })

    return !!data?.wallet
  } catch (error) {
    console.error(error)
    return false
  }
}

type FetchLinkedWallets = (params: { walletPublicKey: string }) => Promise<Array<LinkedWallet>>
export const fetchLinkedWallets: FetchLinkedWallets = async ({ walletPublicKey }) => {
  try {
    const { data } = await axios.get<{ data: Array<LinkedWallet> }>(
      `${BACKEND_BASE_URL}/leaderboard/linked-wallets/${walletPublicKey}`,
    )

    return data.data
  } catch (error) {
    return [
      {
        type: 'main',
        wallet: walletPublicKey,
      },
    ]
  }
}

type LinkWallet = (params: {
  linkedWalletJwt: string
  wallet: string
  signature: string
}) => Promise<MutationResponse>
export const linkWallet: LinkWallet = async ({ linkedWalletJwt, wallet, signature }) => {
  try {
    const { data } = await axios.post<{ data: MutationResponse }>(
      `${BACKEND_BASE_URL}/leaderboard/link-wallet`,
      {
        publicKey: wallet,
        signature,
      },
      {
        headers: {
          Authorization: `Bearer ${linkedWalletJwt}`,
        },
      },
    )

    return data.data
  } catch (error) {
    console.error(error)
    return {
      message: 'Unable to link wallet',
      success: false,
    }
  }
}

type UnlinkWallet = (params: { jwt: string; walletToUnlink: string }) => Promise<MutationResponse>
export const unlinkWallet: UnlinkWallet = async ({ jwt, walletToUnlink }) => {
  try {
    const { data } = await axios.delete<{ data: MutationResponse }>(
      `${BACKEND_BASE_URL}/leaderboard/unlink-wallet`,
      {
        data: {
          wallet: walletToUnlink,
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    )

    return data.data
  } catch (error) {
    console.error(error)
    return {
      message: 'Unable to unlink wallet',
      success: false,
    }
  }
}

type FetchUserLockedRewards = (props: { publicKey: string }) => Promise<UserLockedRewards>
export const fetchUserLockedRewards: FetchUserLockedRewards = async ({ publicKey }) => {
  try {
    const { data } = await axios.get<{ data: UserLockedRewards }>(
      `${BACKEND_BASE_URL}/stats/locked-rewards/${publicKey}`,
    )

    return data?.data ?? { rewards: 0 }
  } catch (error) {
    return { rewards: 0 }
  }
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
  userType: string
  order?: string
  skip: number
  limit: number
  timeRangeType: LeaderboardTimeRange
}) => Promise<LeaderboardData[]>
export const fetchLeaderboardData: FetchLeaderboardData = async ({
  walletPubkey,
  order = 'asc',
  userType,
  skip,
  limit,
  timeRangeType,
}) => {
  try {
    const { data } = await axios.get<{ data: LeaderboardData[] }>(
      `${BACKEND_BASE_URL}/leaderboard/${walletPubkey}?order=${order}&skip=${skip}&limit=${limit}&userType=${userType}&timeRangeType=${timeRangeType}`,
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

type FetchBonkWithdrawal = (props: { walletPubkey: string }) => Promise<BonkWithdrawal | null>
export const fetchBonkWithdrawal: FetchBonkWithdrawal = async ({ walletPubkey }) => {
  try {
    const { data: bondWithdrawal } = await axios.get<BonkWithdrawal>(
      `${BACKEND_BASE_URL}/leaderboard/request-bonk-withdrawal/${walletPubkey}`,
    )

    try {
      await BonkWithdrawalSchema.parseAsync(bondWithdrawal)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return bondWithdrawal || null
  } catch (error) {
    return null
  }
}

type SendBonkWithdrawal = (props: {
  bonkWithdrawal: BonkWithdrawal
  walletPubkey: string
}) => Promise<void>
export const sendBonkWithdrawal: SendBonkWithdrawal = async ({ bonkWithdrawal, walletPubkey }) => {
  await axios.post(
    `${BACKEND_BASE_URL}/leaderboard/process-bonk-withdrawal/${walletPubkey}`,
    bonkWithdrawal,
  )
}
