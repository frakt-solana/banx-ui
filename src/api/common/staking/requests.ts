import axios from 'axios'
import { BN } from 'fbonds-core'

import {
  BanxStakeInfoResponse,
  BanxStakeInfoResponseSchema,
  BanxStakingSettings,
  BanxStakingSettingsSchema,
} from '@banx/api/common/staking/schemas'
import { validateResponse } from '@banx/api/shared'
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

  if (!data?.data) return null

  await validateResponse(data.data, BanxStakeInfoResponseSchema)

  return convertToBanxInfoBN(data.data)
}

type FetchBanxStakeSettings = () => Promise<BanxStakingSettingsBN | null>
export const fetchBanxStakeSettings: FetchBanxStakeSettings = async () => {
  const { data } = await axios.get<{ data: BanxStakingSettings }>(
    `${BACKEND_BASE_URL}/staking/v2/settings`,
  )

  if (!data?.data) return null

  await validateResponse(data.data, BanxStakingSettingsSchema)

  return convertToBanxStakingSettingsBN(data.data)
}

export const fetchBanxTokenCirculatingAmount = async () => {
  const { data } = await axios.get<number>(`${BACKEND_BASE_URL}/tokenStake/token/circulating`)

  if (!data || isNaN(data)) return ZERO_BN

  return new BN(data).mul(new BN(10 ** BANX_TOKEN_DECIMALS))
}
