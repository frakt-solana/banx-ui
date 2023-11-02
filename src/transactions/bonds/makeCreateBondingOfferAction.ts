import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  createPerpetualBondOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeCreateBondingOfferActionParams = {
  marketPubkey: string
  loanValue: number //? value in sol
  loansAmount: number
  deltaValue: number //? value in sol
  bondingCurveType?: BondingCurveType
}

export type MakeCreateBondingOfferAction = MakeActionFn<
  MakeCreateBondingOfferActionParams,
  BondOfferOptimistic
>

export const makeCreateBondingOfferAction: MakeCreateBondingOfferAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const {
    marketPubkey,
    loanValue,
    loansAmount,
    bondingCurveType = BondingCurveType.Linear,
    deltaValue,
  } = ixnParams

  const { instructions, signers, optimisticResult } = await createPerpetualBondOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection,
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    args: {
      loanValue: loanValue * 1e9,
      delta: deltaValue * 1e9,
      quantityOfLoans: loansAmount,
      bondingCurveType,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    additionalResult: optimisticResult,
    lookupTables: [],
  }
}
