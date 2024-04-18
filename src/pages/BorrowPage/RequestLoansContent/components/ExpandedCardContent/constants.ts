import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

export enum TabName {
  NFTS = 'nfts',
  ACTIVITY = 'activity',
}

export const TABS = [
  {
    label: 'My NFTs',
    value: TabName.NFTS,
  },
  {
    label: 'Activity',
    value: TabName.ACTIVITY,
  },
]

export const DEFAULT_TAB_VALUE = TABS[0].value

export const INPUT_TOKEN_STEP = {
  [LendingTokenType.NativeSol]: 0.1, //? 0.1 SOL
  [LendingTokenType.Usdc]: 1, //? 1 USDC
}
