import axios from 'axios'
import { web3 } from 'fbonds-core'
import { uniqueId } from 'lodash'

export type HeliusPriorityFeeLevels =
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
    throw new Error('failed to fetch priority fees from helius rpc')

  return Math.round(data.result.priorityFeeEstimate)
}
