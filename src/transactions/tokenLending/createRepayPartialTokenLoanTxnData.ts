import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { repayPartialPerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateRepayPartialTokenLoanTxnData = (params: {
  loan: core.TokenLoan
  fractionToRepay: number //? F.E 50% => 5000
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<core.TokenLoan>>

export const createRepayPartialTokenLoanTxnData: CreateRepayPartialTokenLoanTxnData = async ({
  fractionToRepay,
  loan,
  walletAndConnection,
}) => {
  const { connection, wallet } = walletAndConnection

  const { fraktBond, bondTradeTransaction } = loan

  const { instructions, signers, optimisticResults } = await repayPartialPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      fractionToRepay,
      optimistic: {
        fraktBond,
        bondTradeTransaction,
        oldBondOffer: getMockBondOffer(),
      },
      lendingTokenType: bondTradeTransaction.lendingToken,
    },
    accounts: {
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      lender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: new web3.PublicKey(wallet.publicKey),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const optimisticResult: core.TokenLoan = optimisticResults.map((optimistic) => ({
    ...loan,
    publicKey: optimistic.fraktBond.publicKey,
    fraktBond: optimistic.fraktBond,
    bondTradeTransaction: optimistic.bondTradeTransaction,
  }))[0]

  return {
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    result: optimisticResult,
  }
}
