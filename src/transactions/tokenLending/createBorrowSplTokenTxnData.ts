import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { borrowPerpetualSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { Offer, core } from '@banx/api/nft'
import { CollateralToken } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { customBNConverter, parseAccountInfoByPubkey, sendTxnPlaceHolder } from '@banx/transactions'

export type CreateBorrowTokenTxnDataParams = {
  collateral: CollateralToken
  tokenType: LendingTokenType
  offer: Offer
  loanValue: BN
  aprRate: BN
}

export type CreateBorrowTokenTxnData = (
  params: CreateBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateBorrowTokenTxnDataParams>>

export const createBorrowSplTokenTxnData: CreateBorrowTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { collateral, loanValue, offer, tokenType } = params

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await borrowPerpetualSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      bondOffer: new web3.PublicKey(offer.publicKey),
      tokenMint: new web3.PublicKey(collateral.collateral.mint),
      hadoMarket: new web3.PublicKey(offer.hadoMarket),
      fraktMarket: new web3.PublicKey(offer.hadoMarket),
    },
    args: {
      amountToGet: loanValue,
      amountToSend: new BN(0),
      optimizeIntoReserves: true,
      lendingTokenType: tokenType,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [
    accountsCollection['bondOffer'],
    accountsCollection['fraktBond'],
    accountsCollection['bondTradeTransaction'],
  ]

  return {
    params,
    instructions,
    signers,
    accounts,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

export const parseTokenBorrowSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const parsedAccountsBN = parseAccountInfoByPubkey(accountInfoByPubkey, customBNConverter)
  const parsedAccounts = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondOffer: parsedAccountsBN?.['bondOfferV3']?.[0] as BondOfferV3,
    bondTradeTransaction: parsedAccounts?.[
      'bondTradeTransactionV3'
    ]?.[0] as core.BondTradeTransaction,
    fraktBond: parsedAccounts?.['fraktBond']?.[0] as core.FraktBond,
  }
}
