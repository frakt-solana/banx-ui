import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  claimPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeClaimActionParams = {
  loan: Loan
}

export type MakeClaimAction = MakeActionFn<MakeClaimActionParams, BondAndTransactionOptimistic>

export const makeClaimAction: MakeClaimAction = async (ixnParams, { connection, wallet }) => {
  const { bondTradeTransaction, fraktBond } = ixnParams.loan || {}

  const { instructions, signers, optimisticResult } = await claimPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
      collateralOwner: new web3.PublicKey(fraktBond.fbondIssuer),
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
      banxStake: new web3.PublicKey(fraktBond.banxStake),
      subscriptionsAndAdventures: [],
    },
    optimistic: {
      fraktBond,
      bondTradeTransaction,
    } as BondAndTransactionOptimistic,
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
