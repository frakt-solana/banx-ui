import { BN } from 'fbonds-core'

import {
  BanxAdventure,
  BanxStakeInfoResponse,
  BanxStakingSettings,
  BanxSubscription,
  BanxTokenStake,
  NftType,
  Stake,
} from './schemas'
import {
  BanxAdventureBN,
  BanxAdventureSubscriptionBN,
  BanxInfoBN,
  BanxNftStakeBN,
  BanxStakeBN,
  BanxStakeNft,
  BanxStakingSettingsBN,
} from './types'

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

const convertToBanxNftStakeBN = (banxStake: Stake): BanxNftStakeBN => {
  const { farmedAmount, ...rest } = banxStake

  return {
    farmedAmount: new BN(farmedAmount),
    ...rest,
  }
}

export const convertToStake = (banxStake: BanxNftStakeBN): Stake => {
  const { farmedAmount, ...rest } = banxStake

  return {
    farmedAmount: farmedAmount.toNumber(),
    ...rest,
  }
}

const convertToBanxStakeNft = (nft: NftType): BanxStakeNft => {
  const { stake, ...rest } = nft

  return {
    stake: stake ? convertToBanxNftStakeBN(stake) : undefined,
    ...rest,
  }
}

const convertToBanxAdventureSubscriptionBN = (
  subscription: BanxSubscription,
): BanxAdventureSubscriptionBN => {
  const {
    stakeTokensAmount,
    amountOfTokensHarvested,
    stakePartnerPointsAmount,
    stakePlayerPointsAmount,
    subscribedAt,
    unsubscribedAt,
    harvestedAt,
    stakeNftAmount,
    ...rest
  } = subscription

  return {
    stakeTokensAmount: new BN(stakeTokensAmount),
    amountOfTokensHarvested: new BN(amountOfTokensHarvested),
    stakePartnerPointsAmount: parseFloat(stakePartnerPointsAmount),
    stakePlayerPointsAmount: parseFloat(stakePlayerPointsAmount),
    subscribedAt: parseInt(subscribedAt),
    unsubscribedAt: parseInt(unsubscribedAt),
    harvestedAt: parseInt(harvestedAt),
    stakeNftAmount: parseInt(stakeNftAmount),
    ...rest,
  }
}

export const convertToBanxSubscription = (
  subscription: BanxAdventureSubscriptionBN,
): BanxSubscription => {
  const {
    stakeTokensAmount,
    amountOfTokensHarvested,
    stakePartnerPointsAmount,
    stakePlayerPointsAmount,
    subscribedAt,
    unsubscribedAt,
    harvestedAt,
    stakeNftAmount,
    ...rest
  } = subscription

  return {
    stakeTokensAmount: stakeTokensAmount.toString(),
    amountOfTokensHarvested: amountOfTokensHarvested.toString(),
    stakePartnerPointsAmount: stakePartnerPointsAmount.toString(),
    stakePlayerPointsAmount: stakePlayerPointsAmount.toString(),
    subscribedAt: subscribedAt.toString(),
    unsubscribedAt: unsubscribedAt.toString(),
    harvestedAt: harvestedAt.toString(),
    stakeNftAmount: stakeNftAmount.toString(),
    ...rest,
  }
}

const convertToBanxAdventureBN = (adventure: BanxAdventure): BanxAdventureBN => {
  const {
    week,
    amountOfTokensHarvested,
    rewardsToBeDistributed,
    tokensPerPoints,
    totalBanxSubscribed,
    totalPartnerPoints,
    totalPlayerPoints,
    totalTokensStaked,
    periodEndingAt,
    periodStartedAt,
    ...rest
  } = adventure

  return {
    week: parseInt(week),
    amountOfTokensHarvested: new BN(amountOfTokensHarvested),
    rewardsToBeDistributed: new BN(rewardsToBeDistributed),
    tokensPerPoints: new BN(tokensPerPoints),
    totalBanxSubscribed: parseInt(totalBanxSubscribed),
    totalPartnerPoints: parseFloat(totalPartnerPoints),
    totalPlayerPoints: parseFloat(totalPartnerPoints),
    totalTokensStaked: new BN(totalTokensStaked),
    periodEndingAt: parseInt(periodEndingAt),
    periodStartedAt: parseInt(periodStartedAt),
    ...rest,
  }
}

export const convertToBanxAdventure = (adventure: BanxAdventureBN): BanxAdventure => {
  const {
    week,
    amountOfTokensHarvested,
    rewardsToBeDistributed,
    tokensPerPoints,
    totalBanxSubscribed,
    totalPartnerPoints,
    totalPlayerPoints,
    totalTokensStaked,
    periodEndingAt,
    periodStartedAt,
    ...rest
  } = adventure

  return {
    week: week.toString(),
    amountOfTokensHarvested: amountOfTokensHarvested.toString(),
    rewardsToBeDistributed: rewardsToBeDistributed.toString(),
    tokensPerPoints: tokensPerPoints.toString(),
    totalBanxSubscribed: totalBanxSubscribed.toString(),
    totalPartnerPoints: totalPartnerPoints.toString(),
    totalPlayerPoints: totalPartnerPoints.toString(),
    totalTokensStaked: totalTokensStaked.toString(),
    periodEndingAt: periodEndingAt.toString(),
    periodStartedAt: periodStartedAt.toString(),
    ...rest,
  }
}

const convertToBanxStakeBN = (tokenStake: BanxTokenStake): BanxStakeBN => {
  const {
    banxNftsStakedQuantity,
    partnerPointsStaked,
    playerPointsStaked,
    adventureSubscriptionsQuantity,
    tokensStaked,
    farmedAmount,
    stakedAt,
    unstakedAt,
    nftsStakedAt,
    nftsUnstakedAt,
    ...rest
  } = tokenStake

  return {
    banxNftsStakedQuantity: parseInt(banxNftsStakedQuantity),
    partnerPointsStaked: parseFloat(partnerPointsStaked),
    playerPointsStaked: parseFloat(playerPointsStaked),
    adventureSubscriptionsQuantity: parseInt(adventureSubscriptionsQuantity),
    tokensStaked: new BN(tokensStaked),
    farmedAmount: new BN(farmedAmount),
    stakedAt: parseInt(stakedAt),
    unstakedAt: parseInt(unstakedAt),
    nftsStakedAt: parseInt(nftsStakedAt),
    nftsUnstakedAt: parseInt(nftsUnstakedAt),
    ...rest,
  }
}

export const convertToBanxStake = (tokenStake: BanxStakeBN): BanxTokenStake => {
  const {
    banxNftsStakedQuantity,
    partnerPointsStaked,
    playerPointsStaked,
    adventureSubscriptionsQuantity,
    tokensStaked,
    farmedAmount,
    stakedAt,
    unstakedAt,
    nftsStakedAt,
    nftsUnstakedAt,
    ...rest
  } = tokenStake

  return {
    banxNftsStakedQuantity: banxNftsStakedQuantity.toString(),
    partnerPointsStaked: partnerPointsStaked.toString(),
    playerPointsStaked: playerPointsStaked.toString(),
    adventureSubscriptionsQuantity: adventureSubscriptionsQuantity.toString(),
    tokensStaked: tokensStaked.toString(),
    farmedAmount: farmedAmount.toString(),
    stakedAt: stakedAt.toString(),
    unstakedAt: unstakedAt.toString(),
    nftsStakedAt: nftsStakedAt.toString(),
    nftsUnstakedAt: nftsUnstakedAt.toString(),
    ...rest,
  }
}

export const convertToBanxInfoBN = (stakeInfoResponse: BanxStakeInfoResponse): BanxInfoBN => {
  const { banxWalletBalance, banxTokenStake, banxAdventures, nfts } = stakeInfoResponse

  return {
    banxWalletBalance: banxWalletBalance ? new BN(banxWalletBalance) : null,
    banxTokenStake: banxTokenStake ? convertToBanxStakeBN(banxTokenStake) : null,
    banxAdventures: banxAdventures.map(({ adventure, adventureSubscription }) => ({
      adventure: convertToBanxAdventureBN(adventure),
      adventureSubscription: adventureSubscription
        ? convertToBanxAdventureSubscriptionBN(adventureSubscription)
        : null,
    })),
    nfts: nfts ? nfts.map(convertToBanxStakeNft) : null,
  }
}
