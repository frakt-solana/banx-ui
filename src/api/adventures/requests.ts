import axios from 'axios'
import { web3 } from 'fbonds-core'

import { AdventuresInfo, AdventuresInfoSchema, BanxStats, BanxStatsSchema } from './types'

type FetchAdventuresInfo = (props: { publicKey?: web3.PublicKey }) => Promise<AdventuresInfo | null>
export const fetchAdventuresInfo: FetchAdventuresInfo = async ({ publicKey }) => {
  try {
    const walletQuery = publicKey ? `?wallet=${publicKey.toBase58()}` : ''

    const { data } = await axios.get<AdventuresInfo>(
      `https://${process.env.BACKEND_DOMAIN}/banx/adventures${walletQuery}`,
    )

    try {
      await AdventuresInfoSchema.parseAsync(data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return (
      data ?? {
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
    const { data } = await axios.get<BanxStats>(`https://${process.env.BACKEND_DOMAIN}/stats/banx`)

    try {
      await BanxStatsSchema.parseAsync(data)
    } catch (validationError) {
      console.error('Schema validation error:', validationError)
    }

    return data ?? DEFAULT_DATA
  } catch (error) {
    return DEFAULT_DATA
  }
}
