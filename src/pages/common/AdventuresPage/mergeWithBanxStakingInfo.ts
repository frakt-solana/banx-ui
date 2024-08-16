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
  const {
    banxTokenStakes,
    banxWalletBalances,
    banxAdventures,
    banxAdventureSubscriptions,
    banxStakes,
  } = dataToMerge

  const mergedBanxAdventures = mergeBanxAdventures(
    banxStakingInfo.banxAdventures.map(({ adventure }) => adventure),
    banxAdventures || [],
  )

  const mergedBanxAdventureSubscriptions = mergeBanxAdventureSubscriptions(
    chain(banxStakingInfo.banxAdventures)
      ?.map(({ adventureSubscription }) => adventureSubscription)
      .compact()
      .value() || [],
    banxAdventureSubscriptions || [],
  )

  const banxAdventuresWithSubscription = mergedBanxAdventures.map((adventure) => ({
    adventure,
    adventureSubscription: mergedBanxAdventureSubscriptions.find(
      ({ adventure: adventurePubkey }) => adventurePubkey === adventure.publicKey,
    ),
  }))

  const banxStakesCompacted = chain(banxStakes || [])
    .compact()
    .value()
  const mergedNfts = banxStakesCompacted.length
    ? mergeBanxNftStakes(banxStakingInfo.nfts || [], banxStakesCompacted || [])
    : banxStakingInfo.nfts

  const mergedBanxWalletBalance = banxWalletBalances
    ? mergeBanxWalletBalances(
        banxStakingInfo.banxWalletBalance || ZERO_BN,
        dataToMerge.banxWalletBalances || [],
      )
    : banxStakingInfo.banxWalletBalance

  const mergedBanxTokenStake = banxStakingInfo.banxTokenStake
    ? mergeBanxTokenStakes(banxStakingInfo.banxTokenStake, banxTokenStakes || [])
    : null

  return {
    ...banxStakingInfo,
    banxWalletBalance: mergedBanxWalletBalance,
    banxAdventures: banxAdventuresWithSubscription,
    banxTokenStake: mergedBanxTokenStake,
    nfts: mergedNfts,
  }
}

const mergeBanxAdventures = (
  banxAdventures: staking.BanxAdventure[],
  nextBanxAdventures: staking.BanxAdventure[],
): staking.BanxAdventure[] => {
  const nextBanxAdventuresByPublicKey = groupBy(nextBanxAdventures, ({ publicKey }) => publicKey)

  return chain(banxAdventures)
    .map((adventure) => {
      const nextBanxAdventures = nextBanxAdventuresByPublicKey[adventure.publicKey] || []

      if (!nextBanxAdventures.length) return adventure

      return calcOptimisticBasedOnBulkSimulation<staking.BanxAdventure>(
        adventure,
        nextBanxAdventures,
        ['periodEndingAt', 'periodStartedAt'],
      )
    })
    .unionWith(nextBanxAdventures, (a, b) => a.publicKey === b.publicKey)
    .value()
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

      return calcOptimisticBasedOnBulkSimulation<staking.BanxAdventureSubscription>(
        subscription,
        nextBanxSubscriptions,
        ['subscribedAt', 'unsubscribedAt', 'harvestedAt'],
      )
    })
    .unionWith(nextBanxSubscriptions, (a, b) => a.publicKey === b.publicKey)
    .value()
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
