import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  borrowerRefinance,
  borrowerRefinanceToSame,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  BondOfferV2,
  BondTradeTransactionV3,
  FraktBond,
  PairState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../../helpers'

export type BorrowRefinanceActionOptimisticResult = {
  loan: core.Loan
  // oldLoan: Loan
  offer: core.Offer
}

type CreateBorrowRefinanceTxnDataParams = {
  loan: core.Loan
  offer: core.Offer
  solToRefinance: number
  aprRate: number //? Base points
  walletAndConnection: WalletAndConnection
}

type CreateBorrowRefinanceTxnData = (
  params: CreateBorrowRefinanceTxnDataParams,
) => Promise<CreateTxnData<BorrowRefinanceActionOptimisticResult>>

export const createBorrowRefinanceTxnData: CreateBorrowRefinanceTxnData = async ({
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
    publicKey: optimisticResult.fraktBond.publicKey,
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.newBondTradeTransaction,
    nft: loan.nft,
  }

  // const oldLoan = {
  //   publicKey: loan.publicKey,
  //   fraktBond: loan.fraktBond,
  //   bondTradeTransaction: optimisticResult.oldBondTradeTransaction,
  //   nft: loan.nft,
  // }

  return {
    instructions,
    signers,
    result: {
      loan: optimisticLoan,
      // oldLoan,
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
}: CreateBorrowRefinanceTxnDataParams) => {
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
    oldBondTradeTransaction: bondTradeTransaction as BondTradeTransactionV3,
    bondOffer: offer as BondOfferV2,
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
