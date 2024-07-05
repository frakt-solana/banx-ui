import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { terminatePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  BondOfferV3,
  BondTradeTransactionV3,
  FraktBond,
} from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateTerminateTxnDataParams = {
  loan: core.Loan
}

type CreateTerminateTxnData = (
  params: CreateTerminateTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateTerminateTxnDataParams>>

export const createTerminateTxnData: CreateTerminateTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan } = params

  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, optimisticResult } = await terminatePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    optimistic: {
      fraktBond,
      bondOffer: getMockBondOffer(),
      bondTradeTransaction,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [
    new web3.PublicKey(optimisticResult.bondOffer.publicKey),
    new web3.PublicKey(optimisticResult.bondTradeTransaction.publicKey),
    new web3.PublicKey(optimisticResult.fraktBond.publicKey),
  ]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

export const parseTerminateSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondOffer: results?.['bondOfferV3'] as BondOfferV3,
    bondTradeTransaction: results?.['bondTradeTransactionV3'] as BondTradeTransactionV3,
    fraktBond: results?.['fraktBond'] as FraktBond,
  }
}
