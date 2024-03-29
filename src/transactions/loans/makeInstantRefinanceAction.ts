import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { instantRefinancePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  BondOfferV2,
  BondTradeTransactionV3,
  FraktBond,
} from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { Loan, Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export interface InstantRefinanceOptimisticResult {
  bondOffer: BondOfferV2
  newBondTradeTransaction: BondTradeTransactionV3
  fraktBond: FraktBond
  oldBondTradeTransaction: BondTradeTransactionV3
}

export type MakeInstantRefinanceActionParams = {
  loan: Loan
  bestOffer: Offer
  priorityFees: number
}

export type MakeInstantRefinanceAction = MakeActionFn<
  MakeInstantRefinanceActionParams,
  InstantRefinanceOptimisticResult
>

export const makeInstantRefinanceAction: MakeInstantRefinanceAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { loan, bestOffer, priorityFees } = ixnParams || {}
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
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    optimistic: {
      oldBondTradeTransaction: bondTradeTransaction as BondTradeTransactionV3,
      bondOffer: bestOffer as BondOfferV2,
      fraktBond: fraktBond as FraktBond,
      minMarketFee: bondTradeTransaction.amountOfBonds,
      oldBondOffer: getMockBondOffer(),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
    priorityFees,
  })

  return {
    instructions,
    signers,
    additionalResult: optimisticResult,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
