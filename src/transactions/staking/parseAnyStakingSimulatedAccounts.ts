import { SimulatedAccountInfoByPubkey } from 'solana-transactions-executor'

import {
  BanxAdventure,
  BanxAdventureSubscription,
  BanxAdventuresWithSubscription,
  BanxStake,
  BanxStakingSettings,
  BanxTokenStake,
} from '@banx/api/common'

import { parseAccountInfoByPubkey } from '../functions'

export const parseAnyStakingSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
): {
  banxStakingSettings: BanxStakingSettings
  banxAdventuresWithSubscription: BanxAdventuresWithSubscription[]
  banxTokenStake: BanxTokenStake
  banxStake: BanxStake
} => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, {
    bnParser: (v) => v,
    pubkeyParser: (v) => v.toBase58(),
  })

  const banxAdventureSubscriptions = results?.[
    'banxAdventureSubscription'
  ] as BanxAdventureSubscription[]
  const banxAdventures = results?.['banxAdventure'] as BanxAdventure[]

  return {
    banxStakingSettings: results?.['banxStakingSettings']?.[0] as BanxStakingSettings,
    banxAdventuresWithSubscription: banxAdventures.map((adventure) => ({
      adventure,
      adventureSubscription: banxAdventureSubscriptions.find(
        ({ adventure: adventurePubkey }) => adventurePubkey === adventure.publicKey,
      ),
    })),
    banxTokenStake: results?.['banxTokenStake']?.[0] as BanxTokenStake,
    banxStake: (results?.['banxStake']?.[0] as BanxStake) || undefined,
  }
}
