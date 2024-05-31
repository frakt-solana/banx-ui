import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE, SANCTUM_PROGRAMM_ID } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  SwapMode,
  closeTokenAccountBanxSol,
  swapSolToBanxSol,
} from 'fbonds-core/lib/fbond-protocol/functions/banxSol'
import { WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

const BANXSOL_ADJUSTMENTS = {
  SELL_RATIO: new BN(999599),
  BUY_RATIO: new BN(998600),
  PRECISION: new BN(1e6),
}

const BANXSOL_LST_IDX = 29
const WSOL_LST_IDX = 1

type GetSwapInstuctions = (params: {
  inputAmount: BN
  walletAndConnection: WalletAndConnection
}) => Promise<{ instructions: web3.TransactionInstruction[]; lookupTable: web3.PublicKey }>

export const getSwapSolToBanxSolInstructions: GetSwapInstuctions = async ({
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

export const getSwapBanxSolToSolInstructions: GetSwapInstuctions = async ({
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
      amount: inputAmount.mul(BANXSOL_ADJUSTMENTS.SELL_RATIO).div(BANXSOL_ADJUSTMENTS.PRECISION),
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
