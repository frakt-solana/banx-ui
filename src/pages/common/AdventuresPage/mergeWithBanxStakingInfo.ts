import { BN } from 'fbonds-core'
import { BanxStakeState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, groupBy, reduce } from 'lodash'

import { staking } from '@banx/api/common'
import { StakingSimulatedAccountsResult } from '@banx/transactions/staking'
import { ZERO_BN } from '@banx/utils'

export const convertStakingSimulatedAccountsToMergeData = (
  stakingSimulatedAccountsResults: StakingSimulatedAccountsResult[],
) => {
  return chain(stakingSimulatedAccountsResults)
    .reduce(
      (
        acc: {
          banxStakingSettings: staking.BanxStakingSettings[]
          banxAdventures: staking.BanxAdventure[]
          banxStakes: staking.BanxStake[]
          banxTokenStakes: staking.BanxTokenStake[]
          banxAdventureSubscriptions: staking.BanxAdventureSubscription[]
        },
        {
          banxAdventureSubscriptions,
          banxAdventures,
          banxStake,
          banxTokenStake,
          banxStakingSettings,
        },
      ) => {
        return {
          banxStakingSettings: [...acc.banxStakingSettings, banxStakingSettings],
          banxAdventures: [...acc.banxAdventures, ...banxAdventures],
          banxStakes: [...acc.banxStakes, banxStake],
          banxTokenStakes: [...acc.banxTokenStakes, banxTokenStake],
          banxAdventureSubscriptions: [
            ...acc.banxAdventureSubscriptions,
            ...banxAdventureSubscriptions,
          ],
        }
      },
      {
        banxStakingSettings: [],
        banxAdventures: [],
        banxStakes: [],
        banxTokenStakes: [],
        banxAdventureSubscriptions: [],
      },
    )
    .value()
}

export const mergeWithBanxStakingInfo = (
  banxStakingInfo: staking.BanxStakingInfo,
  dataToMerge: Partial<{
    banxTokenStakes: staking.BanxTokenStake[]
    banxWalletBalances: BN[]
    banxAdventures: staking.BanxAdventure[]
    banxAdventureSubscriptions: staking.BanxAdventureSubscription[]
    banxStakes: staking.BanxStake[]
  }>,
): staking.BanxStakingInfo => {
  const banxAdventures = dataToMerge?.banxAdventures
    ? mergeBanxAdventures(
        banxStakingInfo.banxAdventures.map(({ adventure }) => adventure),
        dataToMerge.banxAdventures,
      )
    : banxStakingInfo.banxAdventures.map(({ adventure }) => adventure)

  const banxAdventureSubscriptions = dataToMerge?.banxAdventureSubscriptions
    ? mergeBanxAdventureSubscriptions(
        chain(banxStakingInfo.banxAdventures)
          ?.map(({ adventureSubscription }) => adventureSubscription)
          .compact()
          .value(),
        dataToMerge.banxAdventureSubscriptions,
      )
    : chain(banxStakingInfo.banxAdventures)
        ?.map(({ adventureSubscription }) => adventureSubscription)
        .compact()
        .value()

  const banxAdventuresWithSubscription = banxAdventures.map((adventure) => ({
    adventure,
    adventureSubscription: banxAdventureSubscriptions.find(
      ({ adventure: adventurePubkey }) => adventurePubkey === adventure.publicKey,
    ),
  }))

  const banxStakes = dataToMerge.banxStakes && chain(dataToMerge.banxStakes).compact().value()

  return {
    ...banxStakingInfo,
    banxWalletBalance: dataToMerge.banxWalletBalances
      ? mergeBanxWalletBalances(
          banxStakingInfo.banxWalletBalance || ZERO_BN,
          dataToMerge.banxWalletBalances || [],
        )
      : banxStakingInfo.banxWalletBalance,
    banxAdventures: banxAdventuresWithSubscription,
    banxTokenStake:
      dataToMerge.banxTokenStakes && banxStakingInfo.banxTokenStake
        ? mergeBanxTokenStakes(banxStakingInfo.banxTokenStake, dataToMerge?.banxTokenStakes)
        : null,
    nfts: banxStakes?.length
      ? mergeBanxNftStakes(banxStakingInfo.nfts || [], dataToMerge.banxStakes || [])
      : banxStakingInfo.nfts,
  }
}

const mergeBanxAdventures = (
  banxAdventures: staking.BanxAdventure[],
  nextBanxAdventures: staking.BanxAdventure[],
): staking.BanxAdventure[] => {
  const nextBanxAdventuresByPublicKey = groupBy(nextBanxAdventures, ({ publicKey }) => publicKey)

  return banxAdventures.map((adventure) => {
    const nextBanxAdventures = nextBanxAdventuresByPublicKey[adventure.publicKey] || []

    if (!nextBanxAdventures.length) return adventure

    return mergeBanxAdventure(adventure, nextBanxAdventures)
  })
}
const mergeBanxAdventure = (
  banxAdventure: staking.BanxAdventure,
  nextBanxAdventures: staking.BanxAdventure[], //? Same adventures as banxAdventure by publicKey
): staking.BanxAdventure => {
  if (!nextBanxAdventures.length) {
    return banxAdventure
  }

  const {
    totalBanxSubscribed: totalBanxSubscribedDiff,
    totalPartnerPoints: totalPartnerPointsDiff,
    totalPlayerPoints: totalPlayerPointsDiff,
    totalTokensStaked: totalTokensStakedDiff,
  } = reduce(
    nextBanxAdventures,
    (diff, adventure) => {
      return {
        totalBanxSubscribed: diff.totalBanxSubscribed.add(
          banxAdventure.totalBanxSubscribed.sub(adventure.totalBanxSubscribed),
        ),
        totalPartnerPoints: diff.totalPartnerPoints.add(
          banxAdventure.totalPartnerPoints.sub(adventure.totalPartnerPoints),
        ),
        totalPlayerPoints: diff.totalPlayerPoints.add(
          banxAdventure.totalPlayerPoints.sub(adventure.totalPlayerPoints),
        ),
        totalTokensStaked: diff.totalPlayerPoints.add(
          banxAdventure.totalPlayerPoints.sub(adventure.totalPlayerPoints),
        ),
      }
    },
    {
      totalBanxSubscribed: ZERO_BN,
      totalPartnerPoints: ZERO_BN,
      totalPlayerPoints: ZERO_BN,
      totalTokensStaked: ZERO_BN,
    },
  )

  return {
    ...(nextBanxAdventures[0] || nextBanxAdventures[0]),
    totalBanxSubscribed: banxAdventure.totalBanxSubscribed.sub(totalBanxSubscribedDiff),
    totalPartnerPoints: banxAdventure.totalPartnerPoints.sub(totalPartnerPointsDiff),
    totalPlayerPoints: banxAdventure.totalPlayerPoints.sub(totalPlayerPointsDiff),
    totalTokensStaked: banxAdventure.totalTokensStaked.sub(totalTokensStakedDiff),
  }
}

const mergeBanxAdventureSubscriptions = (
  banxSubscriptions: staking.BanxAdventureSubscription[],
  nextBanxSubscriptions: staking.BanxAdventureSubscription[],
): staking.BanxAdventureSubscription[] => {
  const nextBanxSubscriptionsByPublicKey = groupBy(
    nextBanxSubscriptions,
    ({ publicKey }) => publicKey,
  )

  return banxSubscriptions.map((subscription) => {
    const nextBanxSubscriptions = nextBanxSubscriptionsByPublicKey[subscription.publicKey] || []

    if (!nextBanxSubscriptions.length) return subscription

    return mergeBanxAdventureSubscription(subscription, nextBanxSubscriptions)
  })
}
const mergeBanxAdventureSubscription = (
  banxSubscription: staking.BanxAdventureSubscription,
  nextBanxSubscriptions: staking.BanxAdventureSubscription[], //? Same subscriptions as banxSubscription by publicKey
): staking.BanxAdventureSubscription => {
  const {
    stakePartnerPointsAmount: stakePartnerPointsAmountDiff,
    stakePlayerPointsAmount: stakePlayerPointsAmountDiff,
    stakeTokensAmount: stakeTokensAmountDiff,
    stakeNftAmount: stakeNftAmountDiff,
  } = reduce(
    nextBanxSubscriptions,
    (diff, subscription) => {
      return {
        stakePartnerPointsAmount: diff.stakePartnerPointsAmount.add(
          banxSubscription.stakePartnerPointsAmount.sub(subscription.stakePartnerPointsAmount),
        ),
        stakePlayerPointsAmount: diff.stakePlayerPointsAmount.add(
          banxSubscription.stakePlayerPointsAmount.sub(subscription.stakePlayerPointsAmount),
        ),
        stakeTokensAmount: diff.stakeTokensAmount.add(
          banxSubscription.stakeTokensAmount.sub(subscription.stakeTokensAmount),
        ),
        stakeNftAmount: diff.stakeNftAmount.add(
          banxSubscription.stakeNftAmount.sub(subscription.stakeNftAmount),
        ),
      }
    },
    {
      stakePartnerPointsAmount: ZERO_BN,
      stakePlayerPointsAmount: ZERO_BN,
      stakeTokensAmount: ZERO_BN,
      stakeNftAmount: ZERO_BN,
    },
  )

  return {
    ...nextBanxSubscriptions[0],
    stakePartnerPointsAmount: banxSubscription.stakePartnerPointsAmount.sub(
      stakePartnerPointsAmountDiff,
    ),
    stakePlayerPointsAmount: banxSubscription.stakePlayerPointsAmount.sub(
      stakePlayerPointsAmountDiff,
    ),
    stakeTokensAmount: banxSubscription.stakeTokensAmount.sub(stakeTokensAmountDiff),
    stakeNftAmount: banxSubscription.stakeNftAmount.sub(stakeNftAmountDiff),
  }
}

const mergeBanxTokenStakes = (
  banxTokenStake: staking.BanxTokenStake,
  nextBanxTokenStakes: staking.BanxTokenStake[],
): staking.BanxTokenStake => {
  const {
    banxNftsStakedQuantity: banxNftsStakedQuantityDiff,
    partnerPointsStaked: partnerPointsStakedDiff,
    playerPointsStaked: playerPointsStakedDiff,
    adventureSubscriptionsQuantity: adventureSubscriptionsQuantityDiff,
    tokensStaked: tokensStakedDiff,
    farmedAmount: farmedAmountDiff,
  } = reduce(
    nextBanxTokenStakes,
    (diff, tokenStake) => {
      return {
        banxNftsStakedQuantity: diff.banxNftsStakedQuantity.add(
          banxTokenStake.banxNftsStakedQuantity.sub(tokenStake.banxNftsStakedQuantity),
        ),
        partnerPointsStaked: diff.partnerPointsStaked.add(
          banxTokenStake.partnerPointsStaked.sub(tokenStake.partnerPointsStaked),
        ),
        playerPointsStaked: diff.playerPointsStaked.add(
          banxTokenStake.playerPointsStaked.sub(tokenStake.playerPointsStaked),
        ),
        adventureSubscriptionsQuantity: diff.adventureSubscriptionsQuantity.add(
          banxTokenStake.adventureSubscriptionsQuantity.sub(
            tokenStake.adventureSubscriptionsQuantity,
          ),
        ),
        tokensStaked: diff.tokensStaked.add(
          banxTokenStake.tokensStaked.sub(tokenStake.tokensStaked),
        ),
        farmedAmount: diff.farmedAmount.add(
          banxTokenStake.farmedAmount.sub(tokenStake.farmedAmount),
        ),
      }
    },
    {
      banxNftsStakedQuantity: ZERO_BN,
      partnerPointsStaked: ZERO_BN,
      playerPointsStaked: ZERO_BN,
      adventureSubscriptionsQuantity: ZERO_BN,
      tokensStaked: ZERO_BN,
      farmedAmount: ZERO_BN,
    },
  )

  return {
    ...nextBanxTokenStakes[0],

    banxNftsStakedQuantity: banxTokenStake.banxNftsStakedQuantity.sub(banxNftsStakedQuantityDiff),
    partnerPointsStaked: banxTokenStake.partnerPointsStaked.sub(partnerPointsStakedDiff),
    playerPointsStaked: banxTokenStake.playerPointsStaked.sub(playerPointsStakedDiff),
    adventureSubscriptionsQuantity: banxTokenStake.adventureSubscriptionsQuantity.sub(
      adventureSubscriptionsQuantityDiff,
    ),
    tokensStaked: banxTokenStake.tokensStaked.sub(tokensStakedDiff),
    farmedAmount: banxTokenStake.farmedAmount.sub(farmedAmountDiff),
  }
}

const mergeBanxNftStakes = (
  prevStakes: staking.BanxNftStake[],
  newStakes: staking.BanxStake[],
): staking.BanxNftStake[] => {
  return prevStakes.map((nftStake) => {
    const newStake = newStakes.find(({ nftMint }) => nftMint === nftStake.mint)
    if (!newStake) return nftStake

    const isNewStakeActive = newStake.banxStakeState === BanxStakeState.Staked

    return { ...nftStake, stake: isNewStakeActive ? newStake : undefined }
  })
}

const mergeBanxWalletBalances = (prevWalletBalance: BN, nextWalletBalances: BN[]): BN => {
  const totalDiff = reduce(
    nextWalletBalances,
    (totalDiff, nextWalletBalance) => totalDiff.add(prevWalletBalance.sub(nextWalletBalance)),
    ZERO_BN,
  )

  return prevWalletBalance.sub(totalDiff)
}
