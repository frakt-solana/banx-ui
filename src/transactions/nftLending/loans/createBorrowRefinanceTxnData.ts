import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  borrowerRefinance,
  borrowerRefinanceToSame,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  BondOfferV3,
  BondTradeTransactionV3,
  FraktBond,
  LendingTokenType,
  PairState,
} from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { coreNew } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol, parseAccountInfoByPubkey } from '@banx/transactions'
import { ZERO_BN, calculateLoanRepayValueOnCertainDate, isBanxSolTokenType } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

export type CreateBorrowRefinanceTxnDataParams = {
  loan: coreNew.Loan
  offer: coreNew.Offer
  solToRefinance: number
  aprRate: BN //? Base points
  tokenType: LendingTokenType
}

type CreateBorrowRefinanceTxnData = (
  params: CreateBorrowRefinanceTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateBorrowRefinanceTxnDataParams>>

export const createBorrowRefinanceTxnData: CreateBorrowRefinanceTxnData = async (
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

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  if (isBanxSolTokenType(tokenType)) {
    const newLoanDebt = new BN(solToRefinance)
    const currentLoanDebt = calculateLoanRepayValueOnCertainDate({
      loan,
      upfrontFeeIncluded: true,
      //? It is necessary to add some time because interest is accumulated even during the transaction processing.
      //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
      date: moment().unix() + 180,
    })

    const upfrontFee = BN.max(newLoanDebt.sub(currentLoanDebt).div(new BN(100)), ZERO_BN)

    //? Upfront fee on reborrow is calculated: (newDebt - prevDebt) / 100
    const diff = newLoanDebt.sub(currentLoanDebt).sub(upfrontFee)

    if (diff.gt(ZERO_BN)) {
      return await banxSol.combineWithSellBanxSolInstructions(
        {
          params,
          accounts,
          inputAmount: diff.abs(),
          instructions,
          signers,
          lookupTables,
        },
        walletAndConnection,
      )
    }

    return await banxSol.combineWithBuyBanxSolInstructions(
      { params, accounts, inputAmount: diff.abs(), instructions, signers, lookupTables },
      walletAndConnection,
    )
  }

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

const getIxnsAndSigners = async (
  params: CreateBorrowRefinanceTxnDataParams,
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
        solToRefinance: new BN(solToRefinance),
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
        solToRefinance: new BN(solToRefinance),
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

export const parseBorrowRefinanceSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondOffer: results?.['bondOfferV3'] as BondOfferV3,
    bondTradeTransaction: results?.['bondTradeTransactionV3'] as BondTradeTransactionV3,
    fraktBond: results?.['fraktBond'] as FraktBond,
  }
}
