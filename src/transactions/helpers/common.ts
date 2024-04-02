import { web3 } from 'fbonds-core'
import { concat, flatMap, map } from 'lodash'

import { calculatePriorityFees } from '@banx/utils'

export const extractAccountKeysFromInstructions = (instructions: web3.TransactionInstruction[]) => {
  const accountKeys = flatMap(instructions, (i) => map(i.keys, (key) => key.pubkey.toBase58()))
  const programIds = map(instructions, (i) => i.programId.toBase58())
  const combinedAccountKeysAndProgramIds = concat(accountKeys, programIds)

  return combinedAccountKeysAndProgramIds
}

export const createInstructionsWithPriorityFees = async (
  instructions: web3.TransactionInstruction[],
  connection: web3.Connection,
) => {
  const accountKeys = extractAccountKeysFromInstructions(instructions)
  const priorityFeesByAccountKeys = await calculatePriorityFees(connection, accountKeys)

  const priorityFeeInstruction = web3.ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: priorityFeesByAccountKeys,
  })

  return [priorityFeeInstruction, ...instructions]
}
