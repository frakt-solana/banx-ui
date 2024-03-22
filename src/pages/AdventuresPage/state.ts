import { Connection } from '@solana/web3.js'
import { web3 } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { create } from 'zustand'

import {
  BanxStake,
  BanxStakeSettings,
  fetchBanxTokenSettings,
  fetchTokenStakeInfo,
} from '@banx/api/banxTokenStake'
import { getTokenBalance } from '@banx/pages/AdventuresPage/helpers'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'

export interface BanxStakeStore {
  banxTokenSettings: BanxStakeSettings | null
  banxStake: BanxStake | null
  balance: string

  updateStake: (props: BanxSubscribeAdventureOptimistic) => void
  loadBanxTokenSettings: () => Promise<void>
  loadBanxStake: (props: { userPubkey?: string }) => Promise<void>
  loadBanxTokenBalance: (props: {
    userPubkey: web3.PublicKey
    connection: Connection
  }) => Promise<void>
}


export const useBanxStakeState = create<BanxStakeStore>((set, getState) => ({
  banxTokenSettings: null,
  banxStake: null,
  balance: "0",
  loadBanxTokenSettings: async () => {
    const banxTokenSettings = await fetchBanxTokenSettings()
    set({
      banxTokenSettings,
    })
  },
  loadBanxStake: async ({ userPubkey }) => {
    const banxStake = await fetchTokenStakeInfo({ userPubkey })
    set({
      banxStake,
    })
  },
  loadBanxTokenBalance: async ({ userPubkey, connection }) => {
    const value = await getTokenBalance(userPubkey, connection, BANX_TOKEN_MINT)
    set({
      balance: value,
    })
  },
  updateStake: (props) => {
    const state = getState()

    if(!state.banxStake){
      return
    }

    const banxAdventuresMap = props.banxAdventures.reduce((acc, adv) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      acc[adv.adventure.publicKey] = adv;
      return acc
    },{})

    const updated = {
      banxTokenSettings: props.banxStakingSettings,
      banxStake: {
        ...state.banxStake,
        banxTokenStake: props.banxTokenStake,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        banxAdventures: state.banxStake.banxAdventures.map((adv) => banxAdventuresMap[adv.adventure.publicKey] ? banxAdventuresMap[adv.adventure.publicKey] : adv)
      },
    }

    set({
        ...updated
    })
  },
}))
