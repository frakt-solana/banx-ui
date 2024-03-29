import { BN } from 'fbonds-core'
import { BanxStakingSettingsState } from 'fbonds-core/lib/fbond-protocol/types'

export enum AdventureStatus {
  LIVE = 'live',
  UPCOMING = 'upcoming',
  ENDED = 'ended',
}

export type BanxStakingSettingsBN = {
  publicKey: string
  banxStaked: BN
  banxStakingSettingsState: BanxStakingSettingsState
  maxTokenStakeAmount: BN
  rewardsHarvested: BN
  tokensPerPartnerPoints: BN
  tokensPerWeek: BN
  tokensStaked: BN
  placeholderOne: string
}
