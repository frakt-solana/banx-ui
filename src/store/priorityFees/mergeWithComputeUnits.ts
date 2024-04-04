import { web3 } from 'fbonds-core'
import { concat, flatMap, map } from 'lodash'

import { getHeliusPriorityFeeEstimate } from '@banx/api/helius'
import { PriorityLevel } from '@banx/store'
import { TransactionError, fetchLookupTableAccount } from '@banx/transactions'

import { DEFAULT_PRIORITY_FEE } from './constants'

const extractAccountKeysFromInstructions = (instructions: web3.TransactionInstruction[]) => {
  const accountsKeys = flatMap(instructions, (ixn) => map(ixn.keys, (key) => key.pubkey.toBase58()))
  const programIds = map(instructions, (i) => i.programId.toBase58())

  return concat(accountsKeys, programIds)
}

type MergeWithComputeUnits = (params: {
  instructions: web3.TransactionInstruction[]
  payer: web3.PublicKey
  connection: web3.Connection
  priorityLevel?: PriorityLevel
  lookupTables: web3.PublicKey[]
}) => Promise<web3.TransactionInstruction[]>
export const mergeWithComputeUnits: MergeWithComputeUnits = async ({
  instructions,
  payer,
  connection,
  priorityLevel = PriorityLevel.DEFAULT,
  lookupTables,
}) => {
  const [computeUnitPriceIxn, computeUnitLimitIxn] = await Promise.all([
    getComputeUnitPriceInstruction({
      instructions,
      priorityLevel,
      connection,
    }),
    getComputeUnitLimitInstruction({
      connection,
      instructions,
      payer,
      lookupTables,
    }),
  ])

  return [computeUnitLimitIxn, computeUnitPriceIxn, ...instructions]
}

type GetComputeUnitPriceInstructionParams = {
  connection: web3.Connection
  instructions: web3.TransactionInstruction[]
  priorityLevel?: PriorityLevel
}
const getComputeUnitPriceInstruction = async ({
  instructions,
  priorityLevel = PriorityLevel.DEFAULT,
  connection,
}: GetComputeUnitPriceInstructionParams) => {
  try {
    const accountKeys = extractAccountKeysFromInstructions(instructions)

    const priorityFee = await getHeliusPriorityFeeEstimate({
      connection,
      accountKeys,
      priorityLevel,
    })

    const computeUnitPriceIxn = web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    })

    return computeUnitPriceIxn
  } catch (error) {
    console.error('Error calculating priority fees:', error)
    console.warn(`Using default prioity fee: ${DEFAULT_PRIORITY_FEE} micro lamports`)
    const computeUnitPriceIxn = web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: DEFAULT_PRIORITY_FEE,
    })
    return computeUnitPriceIxn
  }
}

const SIMULATION_CU_LIMIT = 1_400_000
const DEFAULT_CU_AMOUNT = 400_000
const CU_AMOUNT_INCREASE = 1.1

type GetComputeUnitLimitInstructionParams = {
  connection: web3.Connection
  instructions: web3.TransactionInstruction[]
  payer: web3.PublicKey
  lookupTables?: web3.PublicKey[]
}
const getComputeUnitLimitInstruction = async ({
  connection,
  instructions,
  lookupTables,
  payer,
}: GetComputeUnitLimitInstructionParams) => {
  const simulationInstructions = [
    web3.ComputeBudgetProgram.setComputeUnitLimit({ units: SIMULATION_CU_LIMIT }),
    ...instructions,
  ]

  const lookupTableAccounts = await Promise.all(
    (lookupTables ?? []).map((lt) => fetchLookupTableAccount(lt, connection)),
  )

  const simulationTransaction = new web3.VersionedTransaction(
    new web3.TransactionMessage({
      instructions: simulationInstructions,
      payerKey: payer,
      recentBlockhash: web3.PublicKey.default.toString(),
    }).compileToV0Message(
      lookupTableAccounts.map(({ value }) => value as web3.AddressLookupTableAccount),
    ),
  )

  const simulation = await connection.simulateTransaction(simulationTransaction, {
    replaceRecentBlockhash: true,
    sigVerify: false,
  })

  if (simulation.value.err) {
    throw new TransactionError('Transaction simualation failed', simulation.value.logs)
  }

  const units = simulation.value.unitsConsumed ?? DEFAULT_CU_AMOUNT

  return web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(units * CU_AMOUNT_INCREASE),
  })
}
