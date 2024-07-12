import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { borrowPerpetualSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { CollateralToken } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/transactions'
import { getTokenDecimals } from '@banx/utils'

export type CreateBorrowTokenTxnDataParams = {
  collateral: CollateralToken
  loanValue: number
  offer: Offer
  tokenType: LendingTokenType
  aprRate: number
}

export type CreateBorrowTokenTxnData = (
  params: CreateBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateBorrowTokenTxnDataParams>>

export const createBorrowSplTokenTxnData: CreateBorrowTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { collateral, loanValue, offer, aprRate, tokenType } = params

  const tokenDecimals = getTokenDecimals(tokenType)

  const { instructions, signers, optimisticResults } = await borrowPerpetualSpl({
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
      amountToSend: 0,
      optimizeIntoReserves: true,
      aprRate,
      lendingTokenType: tokenType,
    },
    optimistics: {
      bondOffer: offer,
      lendingTokenDecimals: tokenDecimals, //? (1e9, 1e6, etc)
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const { fraktBond, bondTradeTransaction, bondOffer } = optimisticResults

  const accounts = [
    new web3.PublicKey(fraktBond.publicKey),
    new web3.PublicKey(bondTradeTransaction.publicKey),
    new web3.PublicKey(bondOffer.publicKey),
  ]

  return {
    params,
    instructions,
    signers,
    accounts,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
