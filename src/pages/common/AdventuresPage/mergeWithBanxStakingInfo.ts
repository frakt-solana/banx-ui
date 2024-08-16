import { BN } from 'fbonds-core'
import { BanxStakeState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, groupBy, reduce } from 'lodash'

import { staking } from '@banx/api/common'
import { StakingSimulatedAccountsResult } from '@banx/transactions/staking'
import { ZERO_BN, calcOptimisticBasedOnBulkSimulation } from '@banx/utils'

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
  return calcOptimisticBasedOnBulkSimulation<staking.BanxAdventure>(
    banxAdventure,
    nextBanxAdventures,
    ['periodEndingAt', 'periodStartedAt'],
  )
}

const mergeBanxAdventureSubscriptions = (
  banxSubscriptions: staking.BanxAdventureSubscription[],
  nextBanxSubscriptions: staking.BanxAdventureSubscription[],
): staking.BanxAdventureSubscription[] => {
  const nextBanxSubscriptionsByPublicKey = groupBy(
    nextBanxSubscriptions,
    ({ publicKey }) => publicKey,
  )

  return chain(banxSubscriptions)
    .map((subscription) => {
      const nextBanxSubscriptions = nextBanxSubscriptionsByPublicKey[subscription.publicKey] || []

      if (!nextBanxSubscriptions.length) return subscription

      return mergeBanxAdventureSubscription(subscription, nextBanxSubscriptions)
    })
    .unionWith(nextBanxSubscriptions, (a, b) => a.publicKey === b.publicKey)
    .value()
}
const mergeBanxAdventureSubscription = (
  banxSubscription: staking.BanxAdventureSubscription,
  nextBanxSubscriptions: staking.BanxAdventureSubscription[], //? Same subscriptions as banxSubscription by publicKey
): staking.BanxAdventureSubscription => {
  return calcOptimisticBasedOnBulkSimulation<staking.BanxAdventureSubscription>(
    banxSubscription,
    nextBanxSubscriptions,
    ['subscribedAt', 'unsubscribedAt', 'harvestedAt'],
  )
}

const mergeBanxTokenStakes = (
  banxTokenStake: staking.BanxTokenStake,
  nextBanxTokenStakes: staking.BanxTokenStake[],
): staking.BanxTokenStake => {
  return calcOptimisticBasedOnBulkSimulation<staking.BanxTokenStake>(
    banxTokenStake,
    nextBanxTokenStakes,
    ['stakedAt', 'unstakedAt', 'nftsStakedAt', 'nftsUnstakedAt'],
  )
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
