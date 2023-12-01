import { USE_BORROW_NFTS_QUERY_KEY } from '@banx/pages/BorrowPage/hooks'
import { USE_MARKETS_PREVIEW_QUERY_KEY } from '@banx/pages/LendPage/hooks'
import { USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY } from '@banx/pages/LoansPage/hooks'
import { USE_LENDER_LOANS_AND_OFFERS_QUERY_KEY } from '@banx/pages/OffersPage/hooks'

export const IDB_QUERY_DATA_KEY = '@banx.queryData'

export const DEFAULT_QUERY_CACHE_TIME = 10 * 60 * 1000 //? 10 minutes

export const QUERY_KEYS_TO_PERSIST = [
  USE_BORROW_NFTS_QUERY_KEY,
  USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY,
  USE_MARKETS_PREVIEW_QUERY_KEY,
  USE_LENDER_LOANS_AND_OFFERS_QUERY_KEY,
]
