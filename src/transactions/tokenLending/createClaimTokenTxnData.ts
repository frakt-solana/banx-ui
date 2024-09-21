import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { claimPerpetualLoanV2Spl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

export type CreateClaimTokenTxnDataParams = {
  loan: core.TokenLoan
}

type CreateClaimTokenTxnData = (
  params: CreateClaimTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateClaimTokenTxnDataParams>>

export const createClaimTokenTxnData: CreateClaimTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan } = params
  const { wallet, connection } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await claimPerpetualLoanV2Spl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
      collateralOwner: new web3.PublicKey(fraktBond.fbondIssuer),
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      userPubkey: wallet.publicKey,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [accountsCollection['fraktBond'], accountsCollection['bondTradeTransaction']]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
