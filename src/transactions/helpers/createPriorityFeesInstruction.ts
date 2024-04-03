import { web3 } from 'fbonds-core'
import { concat, flatMap, map } from 'lodash'

import { getHeliusPriorityFeeEstimate } from '@banx/api/helius'
import { DEFAULT_PRIORITY_FEE, usePriorityFeesState } from '@banx/store'

const extractAccountKeysFromInstructions = (instructions: web3.TransactionInstruction[]) => {
  const accountsKeys = flatMap(instructions, (ixn) => map(ixn.keys, (key) => key.pubkey.toBase58()))
  const programIds = map(instructions, (i) => i.programId.toBase58())

  return concat(accountsKeys, programIds)
}

export const createPriorityFeesInstruction = async (
  instructions: web3.TransactionInstruction[],
  connection: web3.Connection,
) => {
  try {
    //? Get priorityLevel outside of components
    const priorityLevel = usePriorityFeesState.getState().priorityLevel

    const accountKeys = extractAccountKeysFromInstructions(instructions)

    const priorityFee = await getHeliusPriorityFeeEstimate({
      connection,
      accountKeys,
      priorityLevel,
    })

    return web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    })
  } catch (error) {
    console.error('Error calculating priority fees:', error)
    console.warn(`Using default prioity fee: ${DEFAULT_PRIORITY_FEE} micro lamports`)
    return web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: DEFAULT_PRIORITY_FEE,
    })
  }
}
