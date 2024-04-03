import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  borrowerRefinance,
  borrowerRefinanceToSame,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  BondOfferV2,
  BondTradeTransactionV3,
  FraktBond,
  LendingTokenType,
  PairState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTransactionDataFn, WalletAndConnection } from 'solana-transactions-executor'

import { Loan, Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { createPriorityFeesInstruction } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export interface BorrowRefinanceActionOptimisticResult {
  loan: Loan
  oldLoan: Loan
  offer: Offer
}

export type MakeBorrowRefinanceActionParams = {
  loan: Loan
  offer: Offer
  solToRefinance: number
  aprRate: number //? Base points
}

export type MakeBorrowRefinanceAction = CreateTransactionDataFn<
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

  const priorityFeeInstruction = await createPriorityFeesInstruction(
    instructions,
    walletAndConnection.connection,
  )

  return {
    instructions: [...instructions, priorityFeeInstruction],
    signers,
    result: {
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
    solToRefinance,
    aprRate,
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
    oldBondTradeTransaction: bondTradeTransaction as BondTradeTransactionV3,
    bondOffer: offer as BondOfferV2,
    fraktBond: fraktBond as FraktBond,
    minMarketFee: aprRate,
  }

  if (
    offer.publicKey === bondTradeTransaction.bondOffer &&
    offer.pairState === PairState.PerpetualBondingCurveOnMarket
  ) {
    const { instructions, signers, optimisticResult } = await borrowerRefinanceToSame({
      args: { solToRefinance, aprRate, lendingTokenType: LendingTokenType.NativeSOL },
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
        solToRefinance,
        aprRate,
        lendingTokenType: LendingTokenType.NativeSOL,
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
