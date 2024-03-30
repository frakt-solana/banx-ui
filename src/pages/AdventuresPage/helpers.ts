import { Connection } from '@solana/web3.js'
import { BN, web3 } from 'fbonds-core'
import { BANX_ADVENTURE_GAP } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculatePlayerPointsForTokens,
  calculateRewardsFromSubscriptions,
} from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { chain } from 'lodash'
import moment from 'moment'

import {
  AdventureStatus,
  BanxAdventureBN,
  BanxAdventureSubscriptionBN,
  BanxStakeBN,
} from '@banx/api/staking'
import { BANX_TOKEN_DECIMALS, BONDS } from '@banx/constants'
import { bnToFixed, bnToHuman } from '@banx/utils/bn'

export async function getTokenBalance(
  userPubKey: web3.PublicKey,
  connection: Connection,
  tokenMint: web3.PublicKey,
): Promise<string> {
  const tokenAccounts = await connection.getTokenAccountsByOwner(userPubKey, {
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    mint: tokenMint,
  })
  const userTokenAccountAddress = tokenAccounts.value[0]?.pubkey
  if (!userTokenAccountAddress) {
    return '0'
  }
  const balance = await connection.getTokenAccountBalance(userTokenAccountAddress)

  return balance?.value.amount?.toString() || '0'
}

//TODO Fix rewards
export const calculateAdventureRewards = (
  params: Array<{ adventure: BanxAdventureBN; subscription?: BanxAdventureSubscriptionBN }>,
): BN => {
  if (!params.length) return new BN(0)

  const hasSubscriptions = !!params.find(({ subscription }) => !!subscription)

  if (!hasSubscriptions) return new BN(0)

  const calculateRewardsParams = chain(params)
    .filter(({ subscription }) => !!subscription)
    .map(({ adventure, subscription }) => ({
      subscriptuionStakeTokensAmount: subscription?.stakeTokensAmount ?? new BN(0),
      adventureStakePartnerPointsAmount: new BN(subscription?.stakePartnerPointsAmount ?? 0),
      adventureTotalPartnerPoints: new BN(adventure.totalPartnerPoints),
      adventureTokensPerPoints: adventure.tokensPerPoints,
      adventureTotalTokensStaked: adventure.totalTokensStaked,
      adventureRewardsToBeDistributed: adventure.rewardsToBeDistributed,
    }))
    .value()

  return calculateRewardsFromSubscriptions(calculateRewardsParams)
}

export const calcPartnerPoints = (tokensAmount: BN, tokensPerPartnerPoints?: BN): number => {
  if (!tokensPerPartnerPoints) {
    return 0
  }

  const partnerPoints =
    bnToHuman(tokensAmount, BANX_TOKEN_DECIMALS) /
    bnToHuman(tokensPerPartnerPoints, BANX_TOKEN_DECIMALS)

  return isNaN(partnerPoints) ? 0 : partnerPoints
}

export const checkIsParticipatingInAdventure = (banxTokenStake?: BanxStakeBN) => {
  if (!banxTokenStake) return false
  if (banxTokenStake.tokensStaked.eq(new BN(0))) return false
  if (banxTokenStake.banxNftsStakedQuantity === 0) return false

  return true
}

export const isAdventureStarted = (adventure: BanxAdventureBN): boolean => {
  return adventure.periodStartedAt + BANX_ADVENTURE_GAP < moment().unix()
}

export const isAdventureEnded = (adventure: BanxAdventureBN): boolean => {
  return adventure.periodEndingAt < moment().unix()
}

export const getAdventureEndTime = (adventure: BanxAdventureBN): number => {
  const isStarted = isAdventureStarted(adventure)

  return isStarted ? adventure.periodEndingAt : adventure.periodStartedAt + BANX_ADVENTURE_GAP
}

export const getAdventureStatus = (adventure: BanxAdventureBN): AdventureStatus => {
  const isEnded = isAdventureEnded(adventure)
  const isStarted = isAdventureStarted(adventure)

  if (isEnded) {
    return AdventureStatus.ENDED
  }

  if (isStarted) {
    return AdventureStatus.LIVE
  }

  return AdventureStatus.UPCOMING
}

//TODO calculatePlayerPointsForTokens gets js number. It crashes on big number
export const calculatePlayerPointsForBanxTokens = (tokensStaked: BN): number => {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const playerPoints = calculatePlayerPointsForTokens(tokensStaked.toString() as any)

  return playerPoints
}

export const banxTokenBNToFixed = (value: BN, fractionDigits = 2) =>
  bnToFixed({ value, fractionDigits, decimals: BANX_TOKEN_DECIMALS })
