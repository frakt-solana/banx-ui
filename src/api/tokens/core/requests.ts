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

  return MOCK_RESPONSE
}

const MOCK_RESPONSE: TokenMarketPreview[] = [
  {
    marketPubkey: 'bonk1672306100278',
    tokenType: 'USDC',

    collateralPrice: 0,
    collateralDecimals: 8,
    bestOffer: 0,

    activeOffersAmount: 0,
    offersTvl: 0,
    activeLoansAmount: 0,
    loansTvl: 0,

    marketApr: 0,
    marketApy: 0,

    collateralImageUrl: 'https://img.cryptorank.io/coins/bonk1672306100278.png',
    collateralTicker: 'BONK',
  },
]
