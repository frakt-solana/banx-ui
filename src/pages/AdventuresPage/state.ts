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

interface UpdatedStake {
  banxTokenSettings: BanxStakeSettings
  banxStake: BanxStake
  balance: number
}

export interface BanxStakeStore {
  banxTokenSettings: BanxStakeSettings | null
  banxStake: BanxStake | null
  balance: number

  updateStake: (props: Partial<UpdatedStake>) => void
  loadBanxTokenSettings: () => Promise<void>
  loadBanxStake: (props: { userPubkey?: string }) => Promise<void>
  loadBanxTokenBalance: (props: {
    userPubkey: web3.PublicKey
    connection: Connection
  }) => Promise<void>
}

export const useBanxStakeState = create<BanxStakeStore>((set) => ({
  banxTokenSettings: null,
  banxStake: null,
  balance: 0,
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
    set({
      ...props,
    })
  },
}))
