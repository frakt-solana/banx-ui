import axios from 'axios'
import { web3 } from 'fbonds-core'
import { uniqueId } from 'lodash'

type HeliusPriorityFeeLevels =
  | 'Min'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax'
  | 'Default'

type GetHeliusPriorityFeeEstimate = (params: {
  connection: web3.Connection
  accountKeys: string[]
  priorityLevel?: HeliusPriorityFeeLevels
}) => Promise<number>

type HeliusPriorityFeeEstimateResponse = {
  id: string
  jsonrpc: string
  result?: {
    priorityFeeEstimate: number
  }
}

export const getHeliusPriorityFeeEstimate: GetHeliusPriorityFeeEstimate = async ({
  connection,
  accountKeys,
  priorityLevel = 'Default',
}): Promise<number> => {
  const MIN_PRIOIRY_FEE_THRESHOLD = 100_000

  try {
    const { data } = await axios.post<HeliusPriorityFeeEstimateResponse>(connection.rpcEndpoint, {
      jsonrpc: '2.0',
      id: uniqueId(),
      method: 'getPriorityFeeEstimate',
      params: [
        {
          accountKeys,

          options: { priorityLevel },
        },
      ],
    })

    if (!data?.result?.priorityFeeEstimate)
      throw new Error('Failed to fetch priority fees from helius rpc')

    const fee = Math.round(data.result.priorityFeeEstimate) + MIN_PRIOIRY_FEE_THRESHOLD

    return fee
  } catch (error) {
    console.error(error)
    return MIN_PRIOIRY_FEE_THRESHOLD
  }
}

type GetHeliusAssetProof = (params: {
  assetId: string
  connection: web3.Connection
}) => Promise<ProofType>

type HeliusAssetProofResponse = {
  id: string
  jsonrpc: string
  result?: ProofType
}

export type ProofType = {
  leaf: string
  node_index: number
  proof: string[]
  root: string
  tree_id: string
}

export const getHeliusAssetProof: GetHeliusAssetProof = async ({ assetId, connection }) => {
  const { data } = await axios.post<HeliusAssetProofResponse>(connection.rpcEndpoint, {
    jsonrpc: '2.0',
    id: uniqueId(),
    method: 'getAssetProof',
    params: {
      id: assetId,
    },
  })

  if (!data?.result) throw new Error('Failed to fetch asset proof from helius rpc')

  return data.result
}
