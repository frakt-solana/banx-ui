import { USE_BORROW_NFTS_V2_QUERY_KEY } from '@banx/pages/nftLending/BorrowPage/hooks'
import { USE_MARKETS_PREVIEW_QUERY_KEY } from '@banx/pages/nftLending/LendPage/hooks'
import {
  USE_BORROWER_LOANS_REQUESTS_QUERY_KEY,
  USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY,
} from '@banx/pages/nftLending/LoansPage/hooks'
import { USE_LENDER_LOANS_QUERY_KEY } from '@banx/pages/nftLending/OffersPage/hooks'

export const IDB_QUERY_DATA_KEY = '@banx.queryData'

export const DEFAULT_QUERY_CACHE_TIME = 10 * 60 * 1000 //? 10 minutes

export const QUERY_KEYS_TO_PERSIST = [
  USE_BORROW_NFTS_V2_QUERY_KEY,
  USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY,
  USE_BORROWER_LOANS_REQUESTS_QUERY_KEY,
  USE_MARKETS_PREVIEW_QUERY_KEY,
  USE_LENDER_LOANS_QUERY_KEY,
]
