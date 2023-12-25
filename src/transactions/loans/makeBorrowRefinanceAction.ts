import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  borrowerRefinance,
  borrowerRefinanceToSame,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  BondOfferV2,
  BondTradeTransactionV2,
  FraktBond,
  PairState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn, WalletAndConnection } from 'solana-transactions-executor'

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
  ixnParams,
  walletAndConnection,
) => {
  const { loan } = ixnParams

  const { instructions, signers, optimisticResult } = await getIxnsAndSigners({
    ixnParams,
    walletAndConnection,
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

const getIxnsAndSigners = async ({
  ixnParams,
  walletAndConnection,
}: {
  ixnParams: MakeBorrowRefinanceActionParams
  walletAndConnection: WalletAndConnection
}) => {
  const { connection, wallet } = walletAndConnection
  const {
    loan: { bondTradeTransaction, fraktBond },
    offer,
  } = ixnParams

  const accounts = {
    fbond: new web3.PublicKey(fraktBond.publicKey),
    userPubkey: wallet.publicKey as web3.PublicKey,
    hadoMarket: new web3.PublicKey(offer.hadoMarket),
    protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
    bondOffer: new web3.PublicKey(offer.publicKey),
    previousLender: new web3.PublicKey(bondTradeTransaction.user),
  }

  const optimistic = {
    oldBondTradeTransaction: bondTradeTransaction as BondTradeTransactionV2,
    bondOffer: offer as BondOfferV2,
    fraktBond: fraktBond as FraktBond,
    minMarketFee: bondTradeTransaction.amountOfBonds,
  }

  if (
    offer.publicKey === bondTradeTransaction.bondOffer &&
    offer.pairState === PairState.PerpetualBondingCurveOnMarket
  ) {
    const { instructions, signers, optimisticResult } = await borrowerRefinanceToSame({
      args: { solToRefinance: offer.currentSpotPrice, aprRate: bondTradeTransaction.amountOfBonds },
      accounts,
      optimistic,
      connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, optimisticResult }
  } else {
    const { instructions, signers, optimisticResult } = await borrowerRefinance({
      args: {
        solToRefinance: offer.currentSpotPrice,
        aprRate: bondTradeTransaction.amountOfBonds,
      },
      accounts: {
        ...accounts,
        oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      },
      optimistic: {
        ...optimistic,
        oldBondOffer: getMockBondOffer(),
      },
      connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, optimisticResult }
  }
}
