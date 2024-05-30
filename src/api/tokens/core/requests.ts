import axios from 'axios'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { convertToMarketType } from '../helpers'
import { TokenMarketPreview, TokenMarketPreviewResponse } from './types'

type FetchTokenMarketsPreview = (props: {
  tokenType: LendingTokenType
}) => Promise<TokenMarketPreview[]>
export const fetchTokenMarketsPreview: FetchTokenMarketsPreview = async ({ tokenType }) => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    isPrivate: String(IS_PRIVATE_MARKETS),
    marketType: String(convertToMarketType(tokenType)),
  })

  const { data } = await axios.get<TokenMarketPreviewResponse>(
    `${BACKEND_BASE_URL}/bonds/spl/preview?${queryParams.toString()}`,
  )

  return data.data
}
