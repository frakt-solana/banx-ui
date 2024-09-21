import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { instantRefinancePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateInstantRefinanceTokenTxnDataParams = {
  loan: core.TokenLoan
  bestOffer: Offer
  aprRate: number
}

type CreateInstantRefinanceTokenTxnData = (
  params: CreateInstantRefinanceTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateInstantRefinanceTokenTxnDataParams>>

export const createInstantRefinanceTokenTxnData: CreateInstantRefinanceTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, bestOffer, aprRate } = params

  const { wallet, connection } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, accounts } = await instantRefinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey,
      hadoMarket: new web3.PublicKey(bestOffer.hadoMarket),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      bondOffer: new web3.PublicKey(bestOffer.publicKey),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    args: {
      lendingTokenType: bondTradeTransaction.lendingToken,
      newApr: new BN(aprRate),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  return {
    params,
    accounts: [accounts['bondOffer']],
    instructions,
    signers,
    lookupTables,
  }
}

export const parseInstantRefinanceTokenSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return results?.['bondOfferV3']?.[0] as BondOfferV3
}
