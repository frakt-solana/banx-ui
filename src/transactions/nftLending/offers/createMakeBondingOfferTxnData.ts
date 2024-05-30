import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE, SANCTUM_PROGRAMM_ID } from 'fbonds-core/lib/fbond-protocol/constants'
import { SwapMode } from 'fbonds-core/lib/fbond-protocol/functions/banxSol'
import {
  BondOfferOptimistic,
  createPerpetualBondOfferBonding,
  getBondingCurveTypeFromLendingToken,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondFeatures, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { calculateOfferSize } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'
import { swapSolToBanxSol } from './swapSolToBanxSol'

type CreateMakeBondingOfferTxnData = (params: {
  marketPubkey: string
  loanValue: number //? normal number
  loansAmount: number
  deltaValue: number //? normal number
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createMakeBondingOfferTxnData: CreateMakeBondingOfferTxnData = async ({
  marketPubkey,
  loanValue,
  loansAmount,
  tokenType,
  deltaValue,
  walletAndConnection,
}) => {
  const bondingCurveType = getBondingCurveTypeFromLendingToken(tokenType)

  const offerSize = calculateOfferSize({ loanValue, loansAmount, deltaValue })

  const { instructions: swapInstructions, signers: swapSigners } = await swapSolToBanxSol({
    programId: SANCTUM_PROGRAMM_ID,
    connection: walletAndConnection.connection,
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      min_amount_out: new BN(0),
      amount: new BN(Math.ceil(offerSize / 0.9986)),
      banxSolLstIndex: 29,
      wSolLstIndex: 1,
      swapMode: SwapMode.SolToBanxSol,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const {
    instructions: createInstructions,
    signers: createSigners,
    optimisticResult,
  } = await createPerpetualBondOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      loanValue: loanValue,
      delta: deltaValue,
      quantityOfLoans: loansAmount,
      bondingCurveType,
      bondFeature: BondFeatures.AutoReceiveAndReceiveNft,
      collateralsPerToken: 0,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions: [...swapInstructions, ...createInstructions],
    signers: [...swapSigners, ...createSigners],
    result: optimisticResult,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
