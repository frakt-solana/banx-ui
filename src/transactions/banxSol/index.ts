import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE, SANCTUM_PROGRAMM_ID } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  SwapMode,
  closeTokenAccountBanxSol,
  swapSolToBanxSol,
} from 'fbonds-core/lib/fbond-protocol/functions/banxSol'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { removeDuplicatedPublicKeys } from '@banx/utils'

import { sendTxnPlaceHolder } from '../helpers'

const BANXSOL_ADJUSTMENTS = {
  SELL_RATIO: new BN(999500),
  BUY_RATIO: new BN(998600),
  PRECISION: new BN(1e6),
  THRESHOLD_INCREMENT: new BN(4500), //? The value to be added if the input value is below the threshold
}

const SOL_THRESHOLD = new BN(1000000)

const BANXSOL_LST_IDX = 29
const WSOL_LST_IDX = 1

type GetSwapInstuctions = (params: {
  inputAmount: BN
  walletAndConnection: WalletAndConnection
}) => Promise<{ instructions: web3.TransactionInstruction[]; lookupTable: web3.PublicKey }>

const getSwapSolToBanxSolInstructions: GetSwapInstuctions = async ({
  inputAmount,
  walletAndConnection,
}) => {
  const { instructions } = await swapSolToBanxSol({
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
      banxSolLstIndex: BANXSOL_LST_IDX,
      wSolLstIndex: WSOL_LST_IDX,
      swapMode: SwapMode.SolToBanxSol,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, lookupTable: new web3.PublicKey(LOOKUP_TABLE) }
}

const isValueBelowThreshold = (inputAmount: BN, treshold: BN) => {
  return inputAmount.lt(treshold)
}

const getSwapBanxSolToSolInstructions: GetSwapInstuctions = async ({
  inputAmount,
  walletAndConnection,
}) => {
  const SELL_RATION = isValueBelowThreshold(inputAmount, SOL_THRESHOLD)
    ? BANXSOL_ADJUSTMENTS.SELL_RATIO.sub(new BN(BANXSOL_ADJUSTMENTS.THRESHOLD_INCREMENT))
    : BANXSOL_ADJUSTMENTS.SELL_RATIO

  const { instructions } = await swapSolToBanxSol({
    programId: SANCTUM_PROGRAMM_ID,
    connection: walletAndConnection.connection,
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      amount: inputAmount.mul(SELL_RATION).div(BANXSOL_ADJUSTMENTS.PRECISION),
      banxSolLstIndex: BANXSOL_LST_IDX,
      wSolLstIndex: WSOL_LST_IDX,
      swapMode: SwapMode.BanxSolToSol,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, lookupTable: new web3.PublicKey(LOOKUP_TABLE) }
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

type CombineWithBanxSolInstructionsParams<TxnResult> = {
  inputAmount: BN
  walletAndConnection: WalletAndConnection
} & CreateTxnData<TxnResult>

export const combineWithBuyBanxSolInstructions = async <TxnResult>({
  inputAmount,
  walletAndConnection,
  ...txnData
}: CombineWithBanxSolInstructionsParams<TxnResult>): Promise<CreateTxnData<TxnResult>> => {
  const { instructions: swapInstructions, lookupTable: swapLookupTable } =
    await getSwapSolToBanxSolInstructions({
      inputAmount,
      walletAndConnection,
    })

  const { instructions: closeInstructions, lookupTable: closeLookupTable } =
    await getCloseBanxSolATAsInstructions({
      walletAndConnection,
    })

  return {
    instructions: [...swapInstructions, ...txnData.instructions, ...closeInstructions],
    signers: txnData.signers,
    result: txnData.result,
    lookupTables: removeDuplicatedPublicKeys([
      swapLookupTable,
      ...(txnData.lookupTables ?? []),
      closeLookupTable,
    ]),
  }
}

export const combineWithSellBanxSolInstructions = async <TxnResult>({
  inputAmount,
  walletAndConnection,
  ...txnData
}: CombineWithBanxSolInstructionsParams<TxnResult>): Promise<CreateTxnData<TxnResult>> => {
  const { instructions: swapInstructions, lookupTable: swapLookupTable } =
    await getSwapBanxSolToSolInstructions({
      inputAmount,
      walletAndConnection,
    })

  const { instructions: closeInstructions, lookupTable: closeLookupTable } =
    await getCloseBanxSolATAsInstructions({
      walletAndConnection,
    })

  return {
    instructions: [...txnData.instructions, ...swapInstructions, ...closeInstructions],
    signers: txnData.signers,
    result: txnData.result,
    lookupTables: removeDuplicatedPublicKeys([
      ...(txnData.lookupTables ?? []),
      swapLookupTable,
      closeLookupTable,
    ]),
  }
}
