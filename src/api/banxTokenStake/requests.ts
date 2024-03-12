import axios from 'axios'
import { web3 } from 'fbonds-core'

import {BanxStake, BanxStakeSchema, BanxStakeSettings, BanxStakeSettingsSchema} from '@banx/api/banxTokenStake/types'
import { BACKEND_BASE_URL } from '@banx/constants'

type FetchTokenStakeInfo = (props: { publicKey?: web3.PublicKey }) => Promise<BanxStake>
export const fetchTokenStakeInfo: FetchTokenStakeInfo = async ({ publicKey }) => {
  const { data } = await axios.get<{ data: BanxStake }>(
    `${BACKEND_BASE_URL}/tokenStake/${publicKey?.toBase58() || ''}`,
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


type FetchBanxTokenSettings = () => Promise<BanxStakeSettings>
export const fetchBanxTokenSettings: FetchBanxTokenSettings = async () => {
  const { data } = await axios.get<{ data: BanxStakeSettings }>(
    `${BACKEND_BASE_URL}/tokenStake/settings`,
  )

  console.log('FetchBanxTokenSettings ', data)

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
