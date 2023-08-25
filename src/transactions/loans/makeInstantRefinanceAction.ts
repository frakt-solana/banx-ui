import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { instantRefinancePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  BondOfferV2,
  BondTradeTransactionV2,
  FraktBond,
} from 'fbonds-core/lib/fbond-protocol/types'

import { Loan, Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

interface OptimisticResult {
  bondOffer: BondOfferV2
  newBondTradeTransaction: BondTradeTransactionV2
  fraktBond: FraktBond
  oldBondTradeTransaction: BondTradeTransactionV2
}

export type MakeInstantRefinanceActionParams = {
  loan: Loan
  bestOffer: Offer
}

export type MakeInstantRefinanceAction = MakeActionFn<
  MakeInstantRefinanceActionParams,
  OptimisticResult
>

export const makeInstantRefinanceAction: MakeInstantRefinanceAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { loan, bestOffer } = ixnParams || {}
  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, optimisticResult } = await instantRefinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
      hadoMarket: new web3.PublicKey(bestOffer.hadoMarket),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      bondOffer: new web3.PublicKey(bestOffer.publicKey),
    },
    optimistic: {
      oldBondTradeTransaction: bondTradeTransaction as BondTradeTransactionV2,
      bondOffer: bestOffer as BondOfferV2,
      fraktBond: fraktBond as FraktBond,
      minMarketFee: 100000, //TODO: Need take from BE
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    additionalResult: optimisticResult,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
