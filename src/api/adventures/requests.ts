import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL } from '@banx/constants'

import { AdventuresInfo, AdventuresInfoSchema, BanxStats, BanxStatsSchema } from './types'

type FetchAdventuresInfo = (props: { publicKey?: web3.PublicKey }) => Promise<AdventuresInfo>
export const fetchAdventuresInfo: FetchAdventuresInfo = async ({ publicKey }) => {
  const { data } = await axios.get<{ data: AdventuresInfo }>(
    `${BACKEND_BASE_URL}/stake/adventures/${publicKey?.toBase58() || ''}`,
  )

  try {
    await AdventuresInfoSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return (
    data.data ?? {
      adventures: [],
    }
  )
}

type FetchBanxStats = () => Promise<BanxStats>
export const fetchBanxStats: FetchBanxStats = async () => {
  const DEFAULT_RESPONSE = {
    totalRevealed: 0,
    totalPartnerPoints: 0,
  }

  const { data } = await axios.get<{ data: BanxStats }>(`${BACKEND_BASE_URL}/stats/banx`)

  try {
    await BanxStatsSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return data.data ?? DEFAULT_RESPONSE
}
