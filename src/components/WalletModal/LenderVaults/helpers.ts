import { BN } from 'fbonds-core'
import { BANX_SOL_STAKING_YEILD_APR } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateBanxSolStakingRewards,
  calculateCurrentInterestSolPure,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { ClusterStats } from '@banx/api/common'
import { UserVault } from '@banx/api/shared'

type GetLenderVaultInfoParams = {
  userVault: UserVault | undefined
  clusterStats: ClusterStats | undefined
}
export const getLenderVaultInfo = ({ userVault, clusterStats }: GetLenderVaultInfoParams) => {
  const { slot = 0, epochStartedAt = 0 } = clusterStats || {}

  const totalAccruedInterest = userVault?.interestRewardsAmount.toNumber() ?? 0
  const totalRepaymets = userVault?.repaymentsAmount.toNumber() ?? 0

  const totalLstYield = userVault
    ? calculateLstYield({ userVault, slot, epochStartedAt }).toNumber()
    : 0

  const totalLiquidityValue = totalAccruedInterest + totalRepaymets
  const totalClaimableValue = totalLiquidityValue + totalLstYield

  const totalFundsInCurrentEpoch = userVault
    ? calculateYieldInCurrentEpoch(userVault, clusterStats)
    : 0

  const totalFundsInNextEpoch = userVault ? calculateYieldInNextEpoch(userVault, clusterStats) : 0

  return {
    totalAccruedInterest,
    totalRepaymets,
    totalLiquidityValue,
    totalLstYield,
    totalClaimableValue,
    totalFundsInCurrentEpoch,
    totalFundsInNextEpoch,
  }
}

type CalculateLstYield = (props: {
  userVault: UserVault
  slot: number
  epochStartedAt: number
}) => BN
const calculateLstYield: CalculateLstYield = ({ userVault, slot, epochStartedAt }) => {
  const totalYield = calculateBanxSolStakingRewards({
    userVault,
    nowSlot: new BN(slot),
    currentEpochStartAt: new BN(epochStartedAt),
  })

  return totalYield
}

export const calculateYieldInCurrentEpoch = (
  userVault: UserVault,
  clusterStats: ClusterStats | undefined,
) => {
  const {
    epochApproxTimeRemaining = 0,
    epochStartedAt = 0,
    epoch = 0,
    slotsInEpoch = 0,
  } = clusterStats || {}

  const epochWhenOfferChanged = userVault.lastCalculatedSlot.toNumber() / slotsInEpoch

  const loanValue =
    epochWhenOfferChanged < epoch
      ? userVault.fundsInCurrentEpoch.add(userVault.fundsInNextEpoch).toNumber()
      : userVault.fundsInCurrentEpoch.toNumber()

  const currentTimeInUnix = moment().unix()
  const epochEndedAt = currentTimeInUnix + epochApproxTimeRemaining

  return calculateCurrentInterestSolPure({
    loanValue,
    startTime: epochStartedAt,
    currentTime: epochEndedAt,
    rateBasePoints: BANX_SOL_STAKING_YEILD_APR,
  })
}

export const calculateYieldInNextEpoch = (
  userVault: UserVault,
  clusterStats: ClusterStats | undefined,
) => {
  const { epochApproxTimeRemaining = 0, epochDuration = 0 } = clusterStats || {}

  const currentTimeInUnix = moment().unix()
  const epochStartedAt = currentTimeInUnix + epochApproxTimeRemaining

  return calculateCurrentInterestSolPure({
    loanValue: userVault.fundsInCurrentEpoch.add(userVault.fundsInNextEpoch).toNumber(),
    startTime: epochStartedAt,
    currentTime: epochStartedAt + epochDuration,
    rateBasePoints: BANX_SOL_STAKING_YEILD_APR,
  })
}
