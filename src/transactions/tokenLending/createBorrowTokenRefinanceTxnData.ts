import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  borrowerRefinance,
  borrowerRefinanceToSame,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3, LendingTokenType, PairState } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { BondTradeTransaction, FraktBond, Offer } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

export type CreateBorrowTokenRefinanceTxnDataParams = {
  loan: core.TokenLoan
  offer: Offer
  solToRefinance: BN
  aprRate: BN
  tokenType: LendingTokenType
}

type CreateBorrowTokenRefinanceTxnData = (
  params: CreateBorrowTokenRefinanceTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateBorrowTokenRefinanceTxnDataParams>>

export const createBorrowTokenRefinanceTxnData: CreateBorrowTokenRefinanceTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, offer, aprRate, solToRefinance, tokenType } = params

  const { instructions, signers, accountsCollection } = await getIxnsAndSigners(
    {
      loan,
      offer,
      aprRate,
      solToRefinance,
      tokenType,
    },
    walletAndConnection,
  )
  const accounts = [
    accountsCollection['bondOffer'],
    accountsCollection['fraktBond'],
    accountsCollection['bondTradeTransaction'],
  ]
  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

const getIxnsAndSigners = async (
  params: CreateBorrowTokenRefinanceTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => {
  const { loan, offer, solToRefinance, aprRate } = params
  const { connection, wallet } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const accounts = {
    fbond: new web3.PublicKey(fraktBond.publicKey),
    userPubkey: wallet.publicKey,
    hadoMarket: new web3.PublicKey(offer.hadoMarket),
    protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
    bondOffer: new web3.PublicKey(offer.publicKey),
    previousLender: new web3.PublicKey(bondTradeTransaction.user),
  }

  if (
    offer.publicKey === bondTradeTransaction.bondOffer &&
    offer.pairState === PairState.PerpetualBondingCurveOnMarket
  ) {
    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await borrowerRefinanceToSame({
      args: {
        solToRefinance,
        aprRate,
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      accounts,
      connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, accountsCollection }
  } else {
    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await borrowerRefinance({
      args: {
        solToRefinance,
        aprRate,
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      accounts: {
        ...accounts,
        oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      },
      connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, accountsCollection }
  }
}

export const parseBorrowTokenRefinanceSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)
  const resultsBN = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return {
    bondOffer: resultsBN?.['bondOfferV3']?.[0] as BondOfferV3,
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as FraktBond,
  }
}
