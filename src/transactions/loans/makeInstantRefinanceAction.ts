import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { instantRefinancePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeInstantRefinanceActionParams = {
  loan: Loan
}

export type MakeInstantRefinanceAction = MakeActionFn<MakeInstantRefinanceActionParams, any>

export const makeInstantRefinanceAction: MakeInstantRefinanceAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { bondTradeTransaction, fraktBond } = ixnParams.loan || {}

  //? bondOffer => get biggest order by market. Check if less then repay

  const { instructions, signers, optimisticResult } = await instantRefinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
      hadoMarket: new web3.PublicKey(fraktBond.publicKey),
      protocolFeeReceiver: new web3.PublicKey(fraktBond.fbondIssuer),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    optimistic: {
      oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.bondOffer),
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      fraktBond: new web3.PublicKey(fraktBond.publicKey),
      minMarketFee: new web3.PublicKey(fraktBond.publicKey),
    } as any,
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
