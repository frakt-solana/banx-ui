import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  borrowerRefinance,
  borrowerRefinanceToSame,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

export type BorrowTokenRefinanceActionOptimisticResult = {
  loan: core.TokenLoan
  offer: Offer
}

type CreateBorrowTokenRefinanceTxnDataParams = {
  loan: core.TokenLoan
  offer: Offer
  solToRefinance: number
  aprRate: number //? Base points
  walletAndConnection: WalletAndConnection
}

type CreateBorrowTokenRefinanceTxnData = (
  params: CreateBorrowTokenRefinanceTxnDataParams,
) => Promise<CreateTxnData<BorrowTokenRefinanceActionOptimisticResult>>

export const createBorrowTokenRefinanceTxnData: CreateBorrowTokenRefinanceTxnData = async ({
  loan,
  offer,
  aprRate,
  solToRefinance,
  walletAndConnection,
}) => {
  const { instructions, signers, optimisticResult } = await getIxnsAndSigners({
    loan,
    offer,
    aprRate,
    solToRefinance,
    walletAndConnection,
  })

  const optimisticLoan = {
    ...loan,
    publicKey: optimisticResult.fraktBond.publicKey,
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.newBondTradeTransaction,
  }

  return {
    instructions,
    signers,
    result: {
      loan: optimisticLoan,
      offer: optimisticResult.bondOffer,
    },
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

const getIxnsAndSigners = async ({
  loan,
  offer,
  solToRefinance,
  aprRate,
  walletAndConnection,
}: CreateBorrowTokenRefinanceTxnDataParams) => {
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
    fraktBond: fraktBond,
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
