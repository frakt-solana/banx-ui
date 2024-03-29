import axios from 'axios'

import {
  BanxStake,
  BanxStakeSchema,
  BanxStakeSettings,
  BanxStakeSettingsSchema,
} from '@banx/api/staking/types'
import { BACKEND_BASE_URL } from '@banx/constants'

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

type FetchBanxStakeSettings = () => Promise<BanxStakeSettings>
export const fetchBanxStakeSettings: FetchBanxStakeSettings = async () => {
  const { data } = await axios.get<{ data: BanxStakeSettings }>(
    `${BACKEND_BASE_URL}/tokenStake/settings`,
  )

  try {
    await BanxStakeSettingsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return (
    data.data ?? {
      adventures: [],
    }
  )
}
