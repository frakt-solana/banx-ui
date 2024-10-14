import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { createPerpetualListingSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { BondTradeTransaction, FraktBond } from '@banx/api/nft'
import { CollateralToken } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { ZERO_BN, getTokenDecimals } from '@banx/utils'

import { parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateTokenListTxnDataParams = {
  collateral: CollateralToken

  borrowAmount: number
  collateralAmount: number //? normal number f.e 200, 300
  aprRate: number
  freezeValue: number

  tokenType: LendingTokenType
}

type CreateListTxnData = (
  params: CreateTokenListTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateTokenListTxnDataParams>>

export const createTokenListTxnData: CreateListTxnData = async (params, walletAndConnection) => {
  const { connection, wallet } = walletAndConnection

  const { aprRate, borrowAmount, collateralAmount, collateral, freezeValue, tokenType } = params

  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const collateralTokenDecimalsMultiplier = Math.pow(10, collateral.collateral.decimals)
  const marketTokenDecimalsMultiplier = Math.pow(10, marketTokenDecimals)

  const collateralsPerToken =
    (collateralAmount / borrowAmount) *
    collateralTokenDecimalsMultiplier *
    marketTokenDecimalsMultiplier

  // console.log({
  //   programId: BONDS.PROGRAM_PUBKEY,
  //   accounts: {
  //     hadoMarket: collateral.marketPubkey,
  //     userPubkey: wallet.publicKey.toBase58(),
  //     collateralMint: collateral.collateral.mint,
  //   },
  //   args: {
  //     amountToGetBorrower: borrowAmount,
  //     collateralsPerToken: collateralsPerToken,
  //     terminationFreeze: freezeValue,
  //     amountToSend: 0,
  //     aprRate: aprRate,

  //     upfrontFeeBasePoints: BONDS.PROTOCOL_FEE,
  //     isBorrowerListing: true,
  //     lendingTokenType: tokenType,
  //   },
  //   connection,
  //   sendTxn: sendTxnPlaceHolder,
  // })

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await createPerpetualListingSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      hadoMarket: new web3.PublicKey(collateral.marketPubkey),
      userPubkey: wallet.publicKey,
      collateralMint: new web3.PublicKey(collateral.collateral.mint),
    },
    args: {
      amountToGetBorrower: new BN(borrowAmount),
      collateralsPerToken: new BN(collateralsPerToken),
      terminationFreeze: new BN(freezeValue),
      amountToSend: ZERO_BN,
      aprRate: new BN(aprRate),

      upfrontFeeBasePoints: BONDS.PROTOCOL_FEE,
      isBorrowerListing: true,
      lendingTokenType: tokenType,
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

export const parseListTokenSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as FraktBond,
  }
}
