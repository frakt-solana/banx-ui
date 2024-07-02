import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { claimPerpetualLoanV2Spl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateClaimTokenTxnData = (params: {
  loan: core.TokenLoan
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<core.TokenLoan>>

export const createClaimTokenTxnData: CreateClaimTokenTxnData = async ({
  loan,
  walletAndConnection,
}) => {
  const { wallet, connection } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, optimisticResult } = await claimPerpetualLoanV2Spl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
      collateralOwner: new web3.PublicKey(fraktBond.fbondIssuer),
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      userPubkey: wallet.publicKey,
    },
    optimistic: {
      fraktBond,
      bondTradeTransaction,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
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
