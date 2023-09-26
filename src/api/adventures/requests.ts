import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL } from '@banx/constants'

import { AdventuresInfo, AdventuresInfoSchema, BanxStats, BanxStatsSchema } from './types'

type FetchAdventuresInfo = (props: { publicKey?: web3.PublicKey }) => Promise<AdventuresInfo | null>
export const fetchAdventuresInfo: FetchAdventuresInfo = async ({ publicKey }) => {
  try {
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
  } catch (error) {
    return null
  }
}

type FetchBanxStats = () => Promise<BanxStats>
export const fetchBanxStats: FetchBanxStats = async () => {
  const DEFAULT_DATA = {
    totalRevealed: 0,
    totalPartnerPoints: 0,
  }

  try {
    const { data } = await axios.get<{ data: BanxStats }>(`${BACKEND_BASE_URL}/stats/banx`)

    try {
      await BanxStatsSchema.parseAsync(data.data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data.data ?? DEFAULT_DATA
  } catch (error) {
    return DEFAULT_DATA
  }
}
