import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { instantRefinancePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { coreNew } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateInstantRefinanceTxnDataParams = {
  loan: coreNew.Loan
  bestOffer: coreNew.Offer
  aprRate: BN
}

type CreateInstantRefinanceTxnData = (
  params: CreateInstantRefinanceTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateInstantRefinanceTxnDataParams>>

export const createInstantRefinanceTxnData: CreateInstantRefinanceTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, bestOffer, aprRate } = params

  const { wallet, connection } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await instantRefinancePerpetualLoan({
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
      newApr: aprRate,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [accountsCollection['bondOffer']]

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

export const parseInstantRefinanceSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return results?.['bondOfferV3'] as BondOfferV3
}
