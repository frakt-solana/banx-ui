import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { createPerpetualListingSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { CollateralToken } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateTokenListTxnDataParams = {
  collateral: CollateralToken

  borrowAmount: number
  collateralAmount: number
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

  const collateralsPerToken = Math.floor(
    (borrowAmount / collateralAmount) * collateral.collateral.decimals,
  )

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await createPerpetualListingSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      hadoMarket: new web3.PublicKey(collateral.marketPubkey),
      userPubkey: wallet.publicKey,
      collateralMint: new web3.PublicKey(collateral.collateral.mint),
      fraktMarket: new web3.PublicKey(collateral.marketPubkey),
    },
    args: {
      amountToGetBorrower: new BN(borrowAmount),
      collateralsPerToken: new BN(collateralsPerToken),
      terminationFreeze: new BN(freezeValue),
      amountToSend: new BN(collateralAmount),
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
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as core.BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as core.FraktBond,
  }
}
