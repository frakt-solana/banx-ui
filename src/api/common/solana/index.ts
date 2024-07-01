import { BN, web3 } from 'fbonds-core'
import { chain, sum } from 'lodash'

import { BONDS, MINUTES_IN_HOUR } from '@banx/constants'

const SAMPLE_HISTORY_HOURS_AMOUNT = 6

export type ClusterStats = {
  slot: number
  avgSlotTime_1min: number //? Amount in seconds
  avgSlotTime_1h: number //? Amount in seconds
  epoch: number
  epochProgress: number //? Fraction. F.e. 0.45, 0.99 etc.
  epochDuration: number
  epochApproxTimeRemaining: number //? Amount in seconds
  blockHeight: number | undefined
  epochStartedAt: number | undefined //? Unix timestamp
  clusterTime: number | undefined //? Unix timestamp
  slotsInEpoch: number
}

export const EMPTY_CLUSTER_STATS: ClusterStats = {
  slot: 0,
  avgSlotTime_1min: 0,
  avgSlotTime_1h: 0,
  epoch: 0,
  epochProgress: 0,
  epochDuration: 0,
  epochApproxTimeRemaining: 0,
  slotsInEpoch: 0,
  blockHeight: undefined,
  epochStartedAt: undefined,
  clusterTime: undefined,
}

type GetClusterStats = (params: { connection: web3.Connection }) => Promise<ClusterStats>

const SLOTS_PER_STEP = 1000

let retries = 0

const retryWithIncreasedSlot = async (
  connection: web3.Connection,
  absoluteSlot: number,
  slotIndex: number,
  avgSlotTime_1h: number,
): Promise<number> => {
  if (retries > 10) {
    throw new Error('Error')
  }

  try {
    const epochStartedAt = (await connection.getBlockTime(absoluteSlot - slotIndex)) || 0
    return epochStartedAt
  } catch (error) {
    console.error('Error:', error)

    retries++

    const x: number | null = await retryWithIncreasedSlot(
      connection,
      absoluteSlot + SLOTS_PER_STEP,
      slotIndex,
      avgSlotTime_1h,
    )

    if (!x) return 0

    return x - SLOTS_PER_STEP * retries * avgSlotTime_1h
  }
}

export const getClusterStats: GetClusterStats = async ({ connection }) => {
  const [epochInfo, performanceSamples] = await Promise.all([
    connection.getEpochInfo(),
    connection.getRecentPerformanceSamples(SAMPLE_HISTORY_HOURS_AMOUNT * 60),
  ])

  const { slotIndex, slotsInEpoch, absoluteSlot, blockHeight, epoch } = epochInfo

  const samples = chain(performanceSamples)
    .filter((sample) => sample.numSlots !== 0)
    .map((sample) => sample.samplePeriodSecs / sample.numSlots)
    .slice(0, MINUTES_IN_HOUR)
    .value()

  const avgSlotTime_1min = samples?.[0] ?? 0

  const samplesInHour = samples.length < MINUTES_IN_HOUR ? samples.length : MINUTES_IN_HOUR
  const avgSlotTime_1h = sum(samples) / samplesInHour

  const [clusterTime, epochStartedAt] = await Promise.all([
    connection.getBlockTime(absoluteSlot).catch(() => undefined),
    retryWithIncreasedSlot(connection, absoluteSlot - slotIndex, slotIndex, avgSlotTime_1h),
  ])

  const epochProgress = slotIndex / slotsInEpoch

  const epochApproxTimeRemaining = (slotsInEpoch - slotIndex) * avgSlotTime_1h

  const epochDuration = slotsInEpoch * avgSlotTime_1h

  const stats: ClusterStats = {
    slot: absoluteSlot,
    avgSlotTime_1min,
    avgSlotTime_1h,
    epoch,
    epochProgress,
    epochDuration,
    epochApproxTimeRemaining,
    blockHeight,
    slotsInEpoch: slotsInEpoch,
    epochStartedAt: epochStartedAt ?? undefined,
    clusterTime: clusterTime ?? undefined,
  }

  return stats
}

export const fetchTokenBalance = async (props: {
  tokenAddress: string
  publicKey: web3.PublicKey
  connection: web3.Connection
}) => {
  const { tokenAddress, publicKey, connection } = props

  const tokenPublicKey = new web3.PublicKey(tokenAddress)
  const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    mint: tokenPublicKey,
  })

  const userTokenAccountAddress = tokenAccounts.value[0]?.pubkey
  const balanceInfo = await connection.getTokenAccountBalance(userTokenAccountAddress)
  const decimals = balanceInfo.value.decimals
  const uiAmount = balanceInfo.value.uiAmount || 0

  return new BN(uiAmount * Math.pow(10, decimals))
}
