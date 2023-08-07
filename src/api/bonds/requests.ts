import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { MarketPreview, MarketPreviewResponse, MarketPreviewSchema } from './types'

type FetchMarketsPreview = (props: { walletPubkey?: web3.PublicKey }) => Promise<MarketPreview[]>
export const fetchMarketsPreview: FetchMarketsPreview = async ({ walletPubkey }) => {
  try {
    const queryParams = new URLSearchParams({
      isPrivate: String(true),
    })

    if (walletPubkey) queryParams.append('wallet', walletPubkey?.toBase58())

    const { data } = await axios.get<MarketPreviewResponse>(
      `${BACKEND_BASE_URL}/bonds/preview?${queryParams.toString()}`,
    )

    // await MarketPreviewSchema.array().parseAsync(data.data)

    return data.data
  } catch (error) {
    console.error(error)
    return []
  }
}
