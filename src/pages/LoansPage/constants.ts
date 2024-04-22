import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Tab } from '@banx/components/Tabs'

export enum LoansTabsNames {
  REQUESTS = 'requests',
  LOANS = 'loans',
  HISTORY = 'history',
}

export const LOANS_TABS: Tab[] = [
  {
    label: 'Requests',
    value: LoansTabsNames.REQUESTS,
  },
  {
    label: 'Loans',
    value: LoansTabsNames.LOANS,
  },
  {
    label: 'History',
    value: LoansTabsNames.HISTORY,
  },
]

export const DEFAULT_TAB_VALUE = LOANS_TABS[0].value

const SECONDS_IN_HOUR = 60 * 60
export const SECONDS_IN_72_HOURS = 72 * SECONDS_IN_HOUR

export const REQUEST_LOANS_TABLE_MESSAGES = {
  [LendingTokenType.NativeSol]: {
    connected: 'Borrow SOL against your NFTs',
    notConnected: 'Connect wallet to borrow SOL against your NFTs',
  },
  [LendingTokenType.Usdc]: {
    connected: 'Borrow USDC against your NFTs',
    notConnected: 'Connect wallet to borrow USDC against your NFTs',
  },
}

export const ACTIVE_LOANS_TABLE_MESSAGES = {
  [LendingTokenType.NativeSol]: {
    connected: 'Borrow SOL against your NFTs',
    notConnected: 'Connect wallet to borrow SOL against your NFTs',
  },
  [LendingTokenType.Usdc]: {
    connected: 'Borrow USDC against your NFTs',
    notConnected: 'Connect wallet to borrow USDC against your NFTs',
  },
}
