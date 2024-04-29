import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  BondAndTransactionOptimistic,
  lendToBorrowerListing,
  refinancePerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTransactionDataFn, WalletAndConnection } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { PriorityLevel, mergeWithComputeUnits } from '@banx/store'
import { isFreezeLoan, sendTxnPlaceHolder } from '@banx/utils'

export type LendToBorrowActionParams = {
  loan: Loan
  priorityFeeLevel: PriorityLevel
}

export type MakeLendToBorrowAction = CreateTransactionDataFn<LendToBorrowActionParams, Loan>

interface OptimisticResult extends BondAndTransactionOptimistic {
  oldBondOffer: BondOfferV2
}

export const makeLendToBorrowAction: MakeLendToBorrowAction = async (
  ixnParams,
  walletAndConnection,
) => {
  const { loan, priorityFeeLevel } = ixnParams

  const {
    instructions: lendToBorrowInstructions,
    signers,
    optimisticResult,
  } = await getIxnsAndSignersByLoanType({
    ixnParams,
    walletAndConnection,
  })

  const instructions = await mergeWithComputeUnits({
    instructions: lendToBorrowInstructions,
    connection: walletAndConnection.connection,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    payer: walletAndConnection.wallet.publicKey,
    priorityLevel: priorityFeeLevel,
  })

  const optimisticLoan = {
    ...loan,
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.bondTradeTransaction,
  }

  return {
    instructions,
    signers,
    result: optimisticLoan,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

const getIxnsAndSignersByLoanType = async ({
  ixnParams,
  walletAndConnection,
}: {
  ixnParams: LendToBorrowActionParams
  walletAndConnection: WalletAndConnection
}) => {
  const { connection, wallet } = walletAndConnection
  const { loan } = ixnParams

  const { nft, bondTradeTransaction, fraktBond } = loan

  if (isFreezeLoan(loan)) {
    const { instructions, signers, optimisticResults } = await lendToBorrowerListing({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        hadoMarket: new web3.PublicKey(fraktBond.hadoMarket || ''),
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        borrower: new web3.PublicKey(loan.fraktBond.fbondIssuer),
        userPubkey: wallet.publicKey,
        nftMint: new web3.PublicKey(nft.mint),
        splTokenMint: undefined,
      },
      args: {
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      optimistic: {
        bondTradeTransaction,
        fraktBond,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    const newOptimisticResult = {
      fraktBond: optimisticResults.fraktBond,
      bondTradeTransaction: optimisticResults.bondTradeTransaction,
    }

    return { instructions, signers, optimisticResult: newOptimisticResult }
  }

  const { instructions, signers, optimisticResult } = await refinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey,
      hadoMarket: new web3.PublicKey(fraktBond.hadoMarket || ''),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      previousLender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    args: {
      lendingTokenType: bondTradeTransaction.lendingToken,
    },
    optimistic: {
      fraktBond,
      oldBondOffer: getMockBondOffer(),
      bondTradeTransaction,
    } as OptimisticResult,
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const newOptimisticResult = {
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.newBondTradeTransaction,
  }

  return { instructions, signers, optimisticResult: newOptimisticResult }
}
