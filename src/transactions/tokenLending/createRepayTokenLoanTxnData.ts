import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { repayPerpetualLoanSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateRepayTokenLoanTxnDataParams = {
  loan: core.TokenLoan
  walletAndConnection: WalletAndConnection
}

type CreateRepayTokenLoanTxnData = (
  params: CreateRepayTokenLoanTxnDataParams,
) => Promise<CreateTxnData<core.TokenLoan>>

export const createRepayTokenLoanTxnData: CreateRepayTokenLoanTxnData = async ({
  loan,
  walletAndConnection,
}) => {
  const { connection, wallet } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, optimisticResults } = await repayPerpetualLoanSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      lender: new web3.PublicKey(bondTradeTransaction.user),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
    },
    args: {
      lendingTokenType: bondTradeTransaction.lendingToken,
    },
    optimistic: {
      oldBondOffer: getMockBondOffer(),
      fraktBond: loan.fraktBond,
      bondTradeTransaction: loan.bondTradeTransaction,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const optimisticLoan: core.TokenLoan = {
    ...loan,
    publicKey: optimisticResults.fraktBond.publicKey,
    fraktBond: optimisticResults.fraktBond,
    bondTradeTransaction: optimisticResults.bondTradeTransaction,
  }

  return {
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    result: optimisticLoan,
  }
}
