import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { borrowerRefinance } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  BondOfferV2,
  BondTradeTransactionV2,
  FraktBond,
} from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { Loan, Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export interface BorrowRefinanceActionOptimisticResult {
  loan: Loan
  oldLoan: Loan
  offer: Offer
}

export type MakeBorrowRefinanceActionParams = {
  loan: Loan
  offer: Offer
}

export type MakeBorrowRefinanceAction = MakeActionFn<
  MakeBorrowRefinanceActionParams,
  BorrowRefinanceActionOptimisticResult
>

export const makeBorrowRefinanceAction: MakeBorrowRefinanceAction = async (
  { loan, offer },
  { connection, wallet },
) => {
  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, optimisticResult } = await borrowerRefinance({
    args: {
      solToRefinance: offer.currentSpotPrice,
    },
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
      hadoMarket: new web3.PublicKey(offer.hadoMarket),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      bondOffer: new web3.PublicKey(offer.publicKey),
      previousLender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    optimistic: {
      oldBondOffer: offer as BondOfferV2,
      oldBondTradeTransaction: loan.bondTradeTransaction as BondTradeTransactionV2,
      bondOffer: offer as BondOfferV2,
      fraktBond: fraktBond as FraktBond,
      minMarketFee: bondTradeTransaction.amountOfBonds,
    },
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    sendTxn: sendTxnPlaceHolder,
  })

  const optimisticLoan = {
    publicKey: optimisticResult.fraktBond.publicKey,
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.newBondTradeTransaction,
    nft: loan.nft,
  }

  const oldLoan = {
    publicKey: loan.publicKey,
    fraktBond: loan.fraktBond,
    bondTradeTransaction: optimisticResult.oldBondTradeTransaction,
    nft: loan.nft,
  }

  return {
    instructions,
    signers,
    additionalResult: {
      loan: optimisticLoan,
      oldLoan,
      offer: optimisticResult.bondOffer,
    },
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
