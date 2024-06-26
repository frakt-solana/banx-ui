import { web3 } from 'fbonds-core'
import { chain, sum } from 'lodash'

import { MINUTES_IN_HOUR } from '@banx/constants'

const SAMPLE_HISTORY_HOURS_AMOUNT = 6

export type ClusterStats = {
  slot: number
  avgSlotTime_1min: number //? Amount in seconds
  avgSlotTime_1h: number //? Amount in seconds
  epoch: number
  epochProgress: number //? Fraction. F.e. 0.45, 0.99 etc.
  epochApproxTimeRemaining: number //? Amount in seconds
  blockHeight: number | undefined
  clusterTime: number | undefined //? Unix timestamp
}

export const EMPTY_CLUSTER_STATS: ClusterStats = {
  slot: 0,
  avgSlotTime_1min: 0,
  avgSlotTime_1h: 0,
  epoch: 0,
  epochProgress: 0,
  epochApproxTimeRemaining: 0,
  blockHeight: undefined,
  clusterTime: undefined,
}

type GetClusterStats = (params: { connection: web3.Connection }) => Promise<ClusterStats>

export const getClusterStats: GetClusterStats = async ({ connection }) => {
  const [epochInfo, performanceSamples] = await Promise.all([
    connection.getEpochInfo(),
    connection.getRecentPerformanceSamples(SAMPLE_HISTORY_HOURS_AMOUNT * 60),
  ])

  const { slotIndex, slotsInEpoch, absoluteSlot, blockHeight, epoch } = epochInfo

  const clusterTime = (await connection.getBlockTime(absoluteSlot)) ?? undefined

  const samples = chain(performanceSamples)
    .filter((sample) => sample.numSlots !== 0)
    .map((sample) => sample.samplePeriodSecs / sample.numSlots)
    .slice(0, MINUTES_IN_HOUR)
    .value()

  const avgSlotTime_1min = samples?.[0] ?? 0

  const samplesInHour = samples.length < MINUTES_IN_HOUR ? samples.length : MINUTES_IN_HOUR
  const avgSlotTime_1h = sum(samples) / samplesInHour

  const epochProgress = slotIndex / slotsInEpoch

  const epochApproxTimeRemaining = (slotsInEpoch - slotIndex) * avgSlotTime_1h

  const stats: ClusterStats = {
    slot: absoluteSlot,
    avgSlotTime_1min,
    avgSlotTime_1h,
    epoch,
    epochProgress,
    epochApproxTimeRemaining,
    blockHeight,
    clusterTime,
  }

  return stats
}
