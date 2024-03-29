import axios from 'axios'

import {
  BanxStake,
  BanxStakeSchema,
  BanxStakingSettings,
  BanxStakingSettingsSchema,
} from '@banx/api/staking/schemas'
import { BACKEND_BASE_URL } from '@banx/constants'

import { convertToBanxStakingSettingsBN } from './helpers'
import { BanxStakingSettingsBN } from './types'

type FetchStakeInfo = (props: { userPubkey?: string }) => Promise<BanxStake>
export const fetchStakeInfo: FetchStakeInfo = async ({ userPubkey }) => {
  const { data } = await axios.get<{ data: BanxStake }>(
    `${BACKEND_BASE_URL}/tokenStake?walletPubkey=${userPubkey || ''}`,
  )

  try {
    await BanxStakeSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return (
    data.data ?? {
      adventures: [],
    }
  )
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
