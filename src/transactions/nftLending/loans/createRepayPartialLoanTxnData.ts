import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { repayPartialPerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { calculateLoanRepayValueOnCertainDate, removeDuplicatedPublicKeys } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateRepayPartialLoanTxnData = (params: {
  loan: core.Loan
  fractionToRepay: number //? F.E 50% => 5000
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<core.Loan>>

export const createRepayPartialLoanTxnData: CreateRepayPartialLoanTxnData = async ({
  fractionToRepay,
  loan,
  walletAndConnection,
}) => {
  const { connection, wallet } = walletAndConnection

  const { fraktBond, bondTradeTransaction, nft } = loan

  const repayValue = calculateLoanRepayValueOnCertainDate({
    loan,
    upfrontFeeIncluded: false,
    date: moment().unix() + 60,
  })
    .mul(new BN(fractionToRepay))
    .div(new BN(BASE_POINTS))

  const { instructions: swapInstructions, lookupTable: swapLookupTable } =
    await banxSol.getSwapSolToBanxSolInstructions({
      inputAmount: repayValue,
      walletAndConnection,
    })

  const {
    instructions: repayInstructions,
    signers: repaySigners,
    optimisticResults,
  } = await repayPartialPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      fractionToRepay,
      optimistic: {
        fraktBond,
        bondTradeTransaction,
        oldBondOffer: getMockBondOffer(),
      },
      lendingTokenType: bondTradeTransaction.lendingToken,
    },
    accounts: {
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      lender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: new web3.PublicKey(wallet.publicKey || EMPTY_PUBKEY),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const { instructions: closeInstructions, lookupTable: closeLookupTable } =
    await banxSol.getCloseBanxSolATAsInstructions({
      walletAndConnection,
    })

  const optimisticResult: core.Loan = optimisticResults.map((optimistic) => ({
    publicKey: optimistic.fraktBond.publicKey,
    fraktBond: optimistic.fraktBond,
    bondTradeTransaction: optimistic.bondTradeTransaction,
    nft,
  }))[0]

  return {
    instructions: [...swapInstructions, ...repayInstructions, ...closeInstructions],
    signers: repaySigners,
    lookupTables: removeDuplicatedPublicKeys([
      swapLookupTable,
      new web3.PublicKey(LOOKUP_TABLE),
      closeLookupTable,
    ]),
    result: optimisticResult,
  }
}
