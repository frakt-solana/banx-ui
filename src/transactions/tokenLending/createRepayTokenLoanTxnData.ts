import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { repayPerpetualLoanSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

export type CreateRepayTokenLoanTxnDataParams = {
  loan: core.TokenLoan
}

type CreateRepayTokenLoanTxnData = (
  params: CreateRepayTokenLoanTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateRepayTokenLoanTxnDataParams>>

export const createRepayTokenLoanTxnData: CreateRepayTokenLoanTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan } = params

  const { instructions, signers, optimisticResults } = await repayPerpetualLoanSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      oldBondOffer: new web3.PublicKey(loan.bondTradeTransaction.bondOffer),
      bondTradeTransaction: new web3.PublicKey(loan.bondTradeTransaction.publicKey),
      lender: new web3.PublicKey(loan.bondTradeTransaction.user),
      fbond: new web3.PublicKey(loan.fraktBond.publicKey),
      collateralTokenMint: new web3.PublicKey(loan.fraktBond.fbondTokenMint),
    },
    args: {
      lendingTokenType: loan.bondTradeTransaction.lendingToken,
    },
    optimistic: {
      oldBondOffer: getMockBondOffer(),
      fraktBond: loan.fraktBond,
      bondTradeTransaction: loan.bondTradeTransaction,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [
    new web3.PublicKey(optimisticResults.fraktBond.publicKey),
    new web3.PublicKey(optimisticResults.bondTradeTransaction.publicKey),
  ]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
