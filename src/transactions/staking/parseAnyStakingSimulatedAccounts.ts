import { SimulatedAccountInfoByPubkey } from 'solana-transactions-executor'

import {
  BanxAdventure,
  BanxAdventureSubscription,
  BanxStake,
  BanxStakingSettings,
  BanxTokenStake,
} from '@banx/api/common'

import { parseAccountInfoByPubkey } from '../functions'

export type StakingSimulatedAccountsResult = {
  banxStakingSettings: BanxStakingSettings
  banxAdventures: BanxAdventure[]
  banxAdventureSubscriptions: BanxAdventureSubscription[]
  banxTokenStake: BanxTokenStake
  banxStake: BanxStake
}
export const parseAnyStakingSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
): StakingSimulatedAccountsResult => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, {
    bnParser: (v) => v,
    pubkeyParser: (v) => v.toBase58(),
  })

  return {
    banxStakingSettings: results?.['banxStakingSettings']?.[0] as BanxStakingSettings,
    banxAdventures: results?.['banxAdventure'] as BanxAdventure[],
    banxAdventureSubscriptions: results?.[
      'banxAdventureSubscription'
    ] as BanxAdventureSubscription[],
    banxTokenStake: results?.['banxTokenStake']?.[0] as BanxTokenStake,
    banxStake: (results?.['banxStake']?.[0] as BanxStake) || undefined,
  }
}
