import axios from 'axios'
import { BN } from 'fbonds-core'

import {
  BanxStakeInfoResponse,
  BanxStakeInfoResponseSchema,
  BanxStakingSettings,
  BanxStakingSettingsSchema,
} from '@banx/api/common/staking/schemas'
import { BACKEND_BASE_URL, BANX_TOKEN_DECIMALS } from '@banx/constants'
import { ZERO_BN } from '@banx/utils'

import { convertToBanxInfoBN, convertToBanxStakingSettingsBN } from './converters'
import { BanxInfoBN, BanxStakingSettingsBN } from './types'

type FetchBanxStakeInfo = (props: { userPubkey?: string }) => Promise<BanxInfoBN | null>
export const fetchBanxStakeInfo: FetchBanxStakeInfo = async ({ userPubkey }) => {
  const queryParams = new URLSearchParams({
    walletPubkey: userPubkey ?? '',
  })

  const { data } = await axios.get<{ data: BanxStakeInfoResponse }>(
    `${BACKEND_BASE_URL}/staking/v2/info?${queryParams.toString()}`,
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
    `${BACKEND_BASE_URL}/staking/v2/settings`,
  )

  try {
    await BanxStakingSettingsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('BanxStakingSettings validation error:', validationError)
  }

  if (!data?.data) return null

  return convertToBanxStakingSettingsBN(data.data)
}

export const fetchBanxTokenCirculatingAmount = async () => {
  const { data } = await axios.get<number>(`${BACKEND_BASE_URL}/tokenStake/token/circulating`)

  if (!data || isNaN(data)) return ZERO_BN

  return new BN(data).mul(new BN(10 ** BANX_TOKEN_DECIMALS))
}
