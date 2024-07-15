import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL } from '@banx/constants'

import { MutationResponse, validateResponse } from '../../shared'
import { getDiscordAvatarUrl } from './helpers'
import {
  BonkWithdrawalSchema,
  LeaderboardDataSchema,
  RefPersonalDataSchema,
  SeasonUserRewardsSchema,
} from './schemas'
import {
  BonkWithdrawal,
  DiscordUserInfo,
  DiscordUserInfoRaw,
  LeaderboardData,
  LeaderboardTimeRange,
  LinkWalletResponse,
  LinkedWallet,
  RefPersonalData,
  SeasonUserRewards,
  WithdrawalTokenType,
} from './types'

type FetchDiscordUser = (props: { publicKey: web3.PublicKey }) => Promise<DiscordUserInfo | null>
export const fetchDiscordUser: FetchDiscordUser = async ({ publicKey }) => {
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
}

type RemoveDiscordUser = (props: { publicKey: web3.PublicKey }) => Promise<void>
export const removeDiscordUser: RemoveDiscordUser = async ({ publicKey }) => {
  await axios.get(`${BACKEND_BASE_URL}/discord/${publicKey.toBase58()}/delete`)
}

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
  const { data } = await axios.get<{ wallet: string }>(`${BACKEND_BASE_URL}/auth/user`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })

  return !!data?.wallet ?? false
}

type FetchLinkedWallets = (params: { walletPublicKey: string }) => Promise<Array<LinkedWallet>>
export const fetchLinkedWallets: FetchLinkedWallets = async ({ walletPublicKey }) => {
  const DEFAULT_RESPONSE: LinkedWallet[] = [
    {
      type: 'main',
      wallet: walletPublicKey,
      borrowerPoints: 0,
      borrowerRank: 0,
      lenderPoints: 0,
      lenderRank: 0,
      boost: 0,
    },
  ]

  const { data } = await axios.get<{ data: Array<LinkedWallet> }>(
    `${BACKEND_BASE_URL}/leaderboard/linked-wallets/${walletPublicKey}`,
  )

  return data.data ?? DEFAULT_RESPONSE
}

type LinkWallet = (params: {
  linkedWalletJwt: string
  wallet: string
  signature: string
}) => Promise<LinkWalletResponse>
export const linkWallet: LinkWallet = async ({ linkedWalletJwt, wallet, signature }) => {
  try {
    const { data } = await axios.post<{ data: LinkWalletResponse }>(
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
    //? Need to warp it into try/catch to get error message (can't trust BE)
    const errorResponse: LinkWalletResponse = {
      message: 'Unable to link wallet',
      success: false,
      borrowerPoints: 0,
      borrowerRank: 0,
      lenderPoints: 0,
      lenderRank: 0,
      boost: 0,
    }
    return errorResponse
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
    //? Need to warp it into try/catch to get error message (can't trust BE)
    return {
      message: 'Unable to unlink wallet',
      success: false,
    }
  }
}

type FetchSeasonUserRewards = (props: { walletPubkey: string }) => Promise<SeasonUserRewards | null>
export const fetchSeasonUserRewards: FetchSeasonUserRewards = async ({ walletPubkey }) => {
  const { data } = await axios.get<{ data: SeasonUserRewards }>(
    `${BACKEND_BASE_URL}/leaderboard/user-rewards/${walletPubkey}`,
  )

  try {
    await SeasonUserRewardsSchema.parseAsync(data?.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data?.data ?? null
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
  const { data } = await axios.get<{ data: LeaderboardData[] }>(
    `${BACKEND_BASE_URL}/leaderboard/list/v2/${walletPubkey}?order=${order}&skip=${skip}&limit=${limit}&userType=${userType}&timeRangeType=${timeRangeType}`,
  )

  await validateResponse(data.data, LeaderboardDataSchema.array())

  return data?.data ?? []
}

type FetchBonkWithdrawal = (props: {
  walletPubkey: string
  tokenName?: WithdrawalTokenType
}) => Promise<BonkWithdrawal | null>
export const fetchBonkWithdrawal: FetchBonkWithdrawal = async ({
  walletPubkey,
  tokenName = 'bonk',
}) => {
  const { data: bondWithdrawal } = await axios.get<BonkWithdrawal>(
    `${BACKEND_BASE_URL}/leaderboard/request-bonk-withdrawal/${walletPubkey}?tokenName=${tokenName}`,
  )

  await validateResponse(bondWithdrawal, BonkWithdrawalSchema)

  return bondWithdrawal ?? null
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

type FetchRefPersonalData = (props: { walletPubkey: string }) => Promise<RefPersonalData | null>
export const fetchRefPersonalData: FetchRefPersonalData = async ({ walletPubkey }) => {
  const { data } = await axios.get<{ data: RefPersonalData }>(
    `${BACKEND_BASE_URL}/leaderboard/ref/personal-data/${walletPubkey}`,
  )

  await validateResponse(data?.data, RefPersonalDataSchema)

  return data?.data ?? null
}

type FetchUserWalletByRefCode = (props: { refCode: string }) => Promise<string>
export const fetchUserWalletByRefCode: FetchUserWalletByRefCode = async ({ refCode }) => {
  const { data } = await axios.get<{ data: { user: string } }>(
    `${BACKEND_BASE_URL}/leaderboard/ref/search/${refCode}`,
  )

  return data?.data.user ?? ''
}

type LinkRef = (params: { refCode: string; walletJwt: string }) => Promise<MutationResponse>

export const linkRef: LinkRef = async ({ refCode, walletJwt }) => {
  try {
    const { data } = await axios.post<{ data: MutationResponse }>(
      `${BACKEND_BASE_URL}/leaderboard/ref`,
      { refCode },
      {
        headers: {
          Authorization: `Bearer ${walletJwt}`,
        },
      },
    )

    return data.data
  } catch (error) {
    const errorResponse: MutationResponse = {
      message: 'Unable to link ref code',
      success: false,
    }

    return errorResponse
  }
}
