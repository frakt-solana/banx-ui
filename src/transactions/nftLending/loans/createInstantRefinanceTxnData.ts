import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { instantRefinancePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'
import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { parseBanxAccountInfo } from '@banx/transactions/functions'

import { sendTxnPlaceHolder } from '../../helpers'

export type CreateInstantRefinanceTxnDataParams = {
  loan: core.Loan
  bestOffer: core.Offer
  aprRate: number
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

  const { instructions, signers, optimisticResult } = await instantRefinancePerpetualLoan({
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
    optimistic: {
      oldBondTradeTransaction: bondTradeTransaction,
      bondOffer: bestOffer,
      fraktBond: fraktBond,
      oldBondOffer: getMockBondOffer(),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [new web3.PublicKey(optimisticResult.bondOffer.publicKey)]

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

//TODO Move results logic into shared separate function?
export const parseInstantRefinanceSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = chain(accountInfoByPubkey)
    .toPairs()
    .filter(([, info]) => !!info)
    .map(([publicKey, info]) => {
      return parseBanxAccountInfo(new web3.PublicKey(publicKey), info)
    })
    .fromPairs()
    .value()

  return results?.['bondOfferV3'] as BondOfferV3
}
