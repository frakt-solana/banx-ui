import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  borrowerRefinance,
  borrowerRefinanceToSame,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

export type CreateBorrowTokenRefinanceTxnDataParams = {
  loan: core.TokenLoan
  offerPublicKey: string
  solToRefinance: number
  aprRate: number //? Base points
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
  const { loan, offerPublicKey, aprRate, solToRefinance, tokenType } = params

  const { instructions, signers, optimisticResult } = await getIxnsAndSigners(
    {
      loan,
      offerPublicKey,
      aprRate,
      solToRefinance,
      tokenType,
    },
    walletAndConnection,
  )

  const accounts = [
    new web3.PublicKey(offerPublicKey),
    new web3.PublicKey(optimisticResult.fraktBond.publicKey),
    new web3.PublicKey(optimisticResult.newBondTradeTransaction.publicKey),
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
  const { loan, offerPublicKey, solToRefinance, aprRate } = params
  const { connection, wallet } = walletAndConnection

  const accounts = {
    fbond: new web3.PublicKey(loan.fraktBond.publicKey),
    userPubkey: wallet.publicKey,
    hadoMarket: new web3.PublicKey(loan.fraktBond.hadoMarket ?? ''),
    protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    previousBondTradeTransaction: new web3.PublicKey(loan.bondTradeTransaction.publicKey),
    bondOffer: new web3.PublicKey(offerPublicKey),
    previousLender: new web3.PublicKey(loan.bondTradeTransaction.user),
  }

  const optimistic = {
    oldBondTradeTransaction: loan.bondTradeTransaction,
    bondOffer: getMockBondOffer(),
    fraktBond: loan.fraktBond,
    minMarketFee: aprRate,
  }

  if (offerPublicKey === loan.bondTradeTransaction.bondOffer) {
    const { instructions, signers, optimisticResult } = await borrowerRefinanceToSame({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      args: {
        solToRefinance,
        aprRate,
        lendingTokenType: loan.bondTradeTransaction.lendingToken,
      },
      accounts,
      optimistic,
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, optimisticResult }
  } else {
    const { instructions, signers, optimisticResult } = await borrowerRefinance({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      args: {
        solToRefinance,
        aprRate,
        lendingTokenType: loan.bondTradeTransaction.lendingToken,
      },
      accounts: {
        ...accounts,
        oldBondOffer: new web3.PublicKey(loan.bondTradeTransaction.bondOffer),
      },
      optimistic: {
        ...optimistic,
        oldBondOffer: getMockBondOffer(),
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, optimisticResult }
  }
}
