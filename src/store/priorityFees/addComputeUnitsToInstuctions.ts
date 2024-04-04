import { web3 } from 'fbonds-core'
import { concat, flatMap, map } from 'lodash'

import { getHeliusPriorityFeeEstimate } from '@banx/api/helius'
import { PriorityLevel } from '@banx/store'

import { DEFAULT_PRIORITY_FEE } from './constants'

const extractAccountKeysFromInstructions = (instructions: web3.TransactionInstruction[]) => {
  const accountsKeys = flatMap(instructions, (ixn) => map(ixn.keys, (key) => key.pubkey.toBase58()))
  const programIds = map(instructions, (i) => i.programId.toBase58())

  return concat(accountsKeys, programIds)
}

export const addComputeUnitsToInstuctions = async (
  instructions: web3.TransactionInstruction[],
  connection: web3.Connection,
  priorityLevel: PriorityLevel = PriorityLevel.DEFAULT,
) => {
  try {
    const accountKeys = extractAccountKeysFromInstructions(instructions)

    const priorityFee = await getHeliusPriorityFeeEstimate({
      connection,
      accountKeys,
      priorityLevel,
    })

    const setComputeUnitPriceIxn = web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    })

    return [setComputeUnitPriceIxn, ...instructions]
  } catch (error) {
    console.error('Error calculating priority fees:', error)
    console.warn(`Using default prioity fee: ${DEFAULT_PRIORITY_FEE} micro lamports`)
    const setComputeUnitPriceIxn = web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: DEFAULT_PRIORITY_FEE,
    })
    return [setComputeUnitPriceIxn, ...instructions]
  }
}
