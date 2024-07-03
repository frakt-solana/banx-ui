import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
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
import { chain } from 'lodash'
import moment from 'moment'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol, parseBanxAccountInfo } from '@banx/transactions'
import { ZERO_BN, calculateLoanRepayValueOnCertainDate, isBanxSolTokenType } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

export type CreateBorrowRefinanceTxnDataParams = {
  loan: core.Loan
  offer: core.Offer
  solToRefinance: number
  aprRate: number //? Base points
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

  const { instructions, signers, optimisticResult } = await getIxnsAndSigners(
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
    new web3.PublicKey(optimisticResult.bondOffer.publicKey),
    new web3.PublicKey(optimisticResult.fraktBond.publicKey),
    new web3.PublicKey(optimisticResult.newBondTradeTransaction),
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

  const optimistic = {
    oldBondTradeTransaction: bondTradeTransaction,
    bondOffer: offer,
    fraktBond: fraktBond as FraktBond,
    minMarketFee: aprRate,
  }

  if (
    offer.publicKey === bondTradeTransaction.bondOffer &&
    offer.pairState === PairState.PerpetualBondingCurveOnMarket
  ) {
    const { instructions, signers, optimisticResult } = await borrowerRefinanceToSame({
      args: {
        solToRefinance,
        aprRate,
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      accounts,
      optimistic,
      connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, optimisticResult }
  } else {
    const { instructions, signers, optimisticResult } = await borrowerRefinance({
      args: {
        solToRefinance,
        aprRate,
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      accounts: {
        ...accounts,
        oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      },
      optimistic: {
        ...optimistic,
        oldBondOffer: getMockBondOffer(),
      },
      connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, optimisticResult }
  }
}

export const parseBorrowRefinanceSimulatedAccounts = (
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

  return {
    bondOffer: results?.['bondOfferV3'] as BondOfferV3,
    bondTradeTransaction: results?.['bondTradeTransactionV3'] as BondTradeTransactionV3,
    fraktBond: results?.['fraktBond'] as FraktBond,
  }
}
