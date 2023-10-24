import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  createPerpetualBondOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeCreateOfferActionParams = {
  marketPubkey: string
  loanValue: number
  loansAmount: number
}

export type MakeCreateOfferAction = MakeActionFn<MakeCreateOfferActionParams, BondOfferOptimistic>

export const makeCreateOfferAction: MakeCreateOfferAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { marketPubkey, loanValue, loansAmount } = ixnParams

  const { instructions, signers, optimisticResult } = await createPerpetualBondOffer({
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    args: {
      loanValue: loanValue * 1e9,
      amountOfLoans: loansAmount,
    },
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    additionalResult: optimisticResult,
    lookupTables: [],
  }
}
