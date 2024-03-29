import { BN } from 'fbonds-core'

import { BanxStakingSettings } from './schemas'
import { BanxStakingSettingsBN } from './types'

export const convertToBanxStakingSettingsBN = (
  banxStakingSettings: BanxStakingSettings,
): BanxStakingSettingsBN => {
  const {
    publicKey,
    banxStaked,
    banxStakingSettingsState,
    maxTokenStakeAmount,
    rewardsHarvested,
    tokensPerPartnerPoints,
    tokensPerWeek,
    tokensStaked,
    placeholderOne,
  } = banxStakingSettings

  return {
    publicKey,
    banxStaked: new BN(banxStaked),
    banxStakingSettingsState,
    maxTokenStakeAmount: new BN(maxTokenStakeAmount),
    rewardsHarvested: new BN(rewardsHarvested),
    tokensPerPartnerPoints: new BN(tokensPerPartnerPoints),
    tokensPerWeek: new BN(tokensPerWeek),
    tokensStaked: new BN(tokensStaked),
    placeholderOne,
  }
}

export const convertToBanxStakingSettingsString = (
  banxStakingSettings: BanxStakingSettingsBN,
): BanxStakingSettings => {
  const {
    publicKey,
    banxStaked,
    banxStakingSettingsState,
    maxTokenStakeAmount,
    rewardsHarvested,
    tokensPerPartnerPoints,
    tokensPerWeek,
    tokensStaked,
    placeholderOne,
  } = banxStakingSettings

  return {
    publicKey,
    banxStaked: banxStaked.toString(),
    banxStakingSettingsState,
    maxTokenStakeAmount: maxTokenStakeAmount.toString(),
    rewardsHarvested: rewardsHarvested.toString(),
    tokensPerPartnerPoints: tokensPerPartnerPoints.toString(),
    tokensPerWeek: tokensPerWeek.toString(),
    tokensStaked: tokensStaked.toString(),
    placeholderOne,
  }
}
