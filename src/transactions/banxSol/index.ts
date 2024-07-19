import { Instruction, createJupiterApiClient } from '@jup-ag/api'
import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE, SANCTUM_PROGRAMM_ID } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  closeTokenAccountBanxSol,
  swapToBanxSol,
  swapToSol,
} from 'fbonds-core/lib/fbond-protocol/functions/banxSol'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BANX_SOL_ADDRESS, BONDS, WSOL_ADDRESS } from '@banx/constants'
import { removeDuplicatedPublicKeys } from '@banx/utils'

import { sendTxnPlaceHolder } from '../helpers'
import { deserializeInstruction } from './helpers'

const BANXSOL_ADJUSTMENTS = {
  BUY_RATIO: new BN(999000),
  PRECISION: new BN(1e6),
}

type GetSwapInstuctions = (params: {
  inputAmount: BN
  walletAndConnection: WalletAndConnection
}) => Promise<{ instructions: web3.TransactionInstruction[]; lookupTables: web3.PublicKey[] }>

const getSwapSolToBanxSolInstructions: GetSwapInstuctions = async ({
  inputAmount,
  walletAndConnection,
}) => {
  const { instructions } = await swapToBanxSol({
    programId: SANCTUM_PROGRAMM_ID,
    connection: walletAndConnection.connection,
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      amount: inputAmount
        .mul(BANXSOL_ADJUSTMENTS.PRECISION)
        .div(BANXSOL_ADJUSTMENTS.BUY_RATIO)
        //? add(1) --> Math.ceil analogue
        .add(new BN(1)),
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, lookupTables: [new web3.PublicKey(LOOKUP_TABLE)] }
}

const getSwapBanxSolToSolInstructions: GetSwapInstuctions = async ({
  inputAmount,
  walletAndConnection,
}) => {
  const { instructions } = await swapToSol({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      amountBanxSol: inputAmount,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, lookupTables: [new web3.PublicKey(LOOKUP_TABLE)] }
}

const getSwapBanxSolToSolJupInstructions: GetSwapInstuctions = async ({
  inputAmount,
  walletAndConnection,
}) => {
  const jupiterQuoteApi = createJupiterApiClient()

  const quote = await jupiterQuoteApi.quoteGet({
    inputMint: BANX_SOL_ADDRESS,
    outputMint: WSOL_ADDRESS,
    amount: inputAmount.toNumber(),
    slippageBps: 300,
    computeAutoSlippage: true,
    swapMode: 'ExactIn',
    onlyDirectRoutes: true,
    asLegacyTransaction: false,
    maxAccounts: 64,
    minimizeSlippage: false,
  })

  const {
    setupInstructions: setupPayload,
    swapInstruction: swapInstructionPayload,
    cleanupInstruction: cleanupPayload,
    addressLookupTableAddresses,
  } = await jupiterQuoteApi.swapInstructionsPost({
    swapRequest: {
      quoteResponse: quote,
      userPublicKey: walletAndConnection.wallet.publicKey.toBase58(),
    },
  })

  const instructions: Instruction[] = []

  if (setupPayload.length) {
    instructions.push(...setupPayload)
  }

  if (swapInstructionPayload) {
    instructions.push(swapInstructionPayload)
  }

  if (cleanupPayload) {
    instructions.push(cleanupPayload)
  }

  const lookupTables = addressLookupTableAddresses.map(
    (lookupTableAddress: string) => new web3.PublicKey(lookupTableAddress),
  )

  return { instructions: instructions.map(deserializeInstruction), lookupTables }
}

type GetCloseBanxSolATAsInstructions = (params: {
  walletAndConnection: WalletAndConnection
}) => Promise<{ instructions: web3.TransactionInstruction[]; lookupTable: web3.PublicKey }>

export const getCloseBanxSolATAsInstructions: GetCloseBanxSolATAsInstructions = async ({
  walletAndConnection,
}) => {
  const { instructions } = await closeTokenAccountBanxSol({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      feeReciver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, lookupTable: new web3.PublicKey(LOOKUP_TABLE) }
}

type CombineWithBanxSolInstructionsParams<Params> = {
  inputAmount: BN
} & CreateTxnData<Params>

export const combineWithBuyBanxSolInstructions = async <Params>(
  params: CombineWithBanxSolInstructionsParams<Params>,
  walletAndConnection: WalletAndConnection,
): Promise<CreateTxnData<Params>> => {
  const { inputAmount, ...txnData } = params

  const { instructions: swapInstructions, lookupTables: swapLookupTable } =
    await getSwapSolToBanxSolInstructions({
      inputAmount,
      walletAndConnection,
    })

  return {
    params: txnData.params,
    accounts: txnData.accounts,
    instructions: [...swapInstructions, ...txnData.instructions],
    signers: txnData.signers,
    lookupTables: removeDuplicatedPublicKeys([...swapLookupTable, ...(txnData.lookupTables ?? [])]),
  }
}

export const combineWithSellBanxSolInstructions = async <Params>(
  params: CombineWithBanxSolInstructionsParams<Params>,
  walletAndConnection: WalletAndConnection,
): Promise<CreateTxnData<Params>> => {
  const { inputAmount, ...txnData } = params

  const { instructions: swapInstructions, lookupTables: swapLookupTable } =
    await getSwapBanxSolToSolInstructions({
      inputAmount,
      walletAndConnection,
    })

  return {
    params: txnData.params,
    accounts: txnData.accounts,
    instructions: [...txnData.instructions, ...swapInstructions],
    signers: txnData.signers,
    lookupTables: removeDuplicatedPublicKeys([...(txnData.lookupTables ?? []), ...swapLookupTable]),
  }
}

export const combineWithSellBanxSolJupInstructions = async <Params>(
  params: CombineWithBanxSolInstructionsParams<Params>,
  walletAndConnection: WalletAndConnection,
): Promise<CreateTxnData<Params>> => {
  const { inputAmount, ...txnData } = params

  const { instructions: swapInstructions, lookupTables: swapLookupTable } =
    await getSwapBanxSolToSolJupInstructions({
      inputAmount,
      walletAndConnection,
    })

  return {
    params: txnData.params,
    accounts: txnData.accounts,
    instructions: [...txnData.instructions, ...swapInstructions],
    signers: txnData.signers,
    lookupTables: removeDuplicatedPublicKeys([...(txnData.lookupTables ?? []), ...swapLookupTable]),
  }
}
