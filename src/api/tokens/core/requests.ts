import axios from 'axios'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'
import { TokenType } from '@banx/store/token'

import { TokenMarketPreview, TokenMarketPreviewResponse } from './types'

type FetchTokenMarketsPreview = (props: { tokenType: TokenType }) => Promise<TokenMarketPreview[]>
export const fetchTokenMarketsPreview: FetchTokenMarketsPreview = async () => {
  const queryParams = new URLSearchParams({
    getAll: String(true),
    isPrivate: String(IS_PRIVATE_MARKETS),
  })

  const { data } = await axios.get<TokenMarketPreviewResponse>(
    `${BACKEND_BASE_URL}/bonds/preview?${queryParams.toString()}`,
  )

  return data.data
}
