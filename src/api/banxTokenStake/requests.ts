import axios from 'axios'

import {
  BanxStake,
  BanxStakeSchema,
  BanxStakeSettings,
  BanxStakeSettingsSchema,
} from '@banx/api/banxTokenStake/types'
import { BACKEND_BASE_URL } from '@banx/constants'

type FetchTokenStakeInfo = (props: { userPubkey?: string }) => Promise<BanxStake>
export const fetchTokenStakeInfo: FetchTokenStakeInfo = async ({ userPubkey }) => {
  const { data } = await axios.get<{ data: BanxStake }>(
    `${BACKEND_BASE_URL}/tokenStake?walletPubkey=${userPubkey || ''}`,
  )

  try {
    await BanxStakeSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data
}

type FetchBanxTokenSettings = () => Promise<BanxStakeSettings>
export const fetchBanxTokenSettings: FetchBanxTokenSettings = async () => {
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
