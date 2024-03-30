import axios from 'axios'

import {
  BanxStakeInfoResponse,
  BanxStakeInfoResponseSchema,
  BanxStakingSettings,
  BanxStakingSettingsSchema,
} from '@banx/api/staking/schemas'
import { BACKEND_BASE_URL } from '@banx/constants'

import { convertToBanxInfoBN, convertToBanxStakingSettingsBN } from './converters'
import { BanxInfoBN, BanxStakingSettingsBN } from './types'

type FetchBanxStakeInfo = (props: { userPubkey?: string }) => Promise<BanxInfoBN | null>
export const fetchBanxStakeInfo: FetchBanxStakeInfo = async ({ userPubkey }) => {
  const { data } = await axios.get<{ data: BanxStakeInfoResponse }>(
    `${BACKEND_BASE_URL}/tokenStake/v2?walletPubkey=${userPubkey || ''}`,
  )

  try {
    await BanxStakeInfoResponseSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  if (!data?.data) return null

  return convertToBanxInfoBN(data.data)
}

type FetchBanxStakeSettings = () => Promise<BanxStakingSettingsBN | null>
export const fetchBanxStakeSettings: FetchBanxStakeSettings = async () => {
  const { data } = await axios.get<{ data: BanxStakingSettings }>(
    `${BACKEND_BASE_URL}/tokenStake/settings`,
  )

  try {
    await BanxStakingSettingsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('BanxStakingSettings validation error:', validationError)
  }

  if (!data?.data) return null

  return convertToBanxStakingSettingsBN(data.data)
}
