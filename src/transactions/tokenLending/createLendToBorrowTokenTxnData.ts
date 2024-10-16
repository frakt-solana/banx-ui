import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  lendToBorrowerListing,
  refinancePerpetualLoan,
  updateLiquidityToUserVault,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { UserVault } from '@banx/api'
import { TokenLoan } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { calculateTokenLoanValueWithUpfrontFee, isTokenLoanListed } from '@banx/utils'

import { sendTxnPlaceHolder } from '../helpers'

export type CreateLendToBorrowTokenTxnDataParams = {
  loan: TokenLoan
  aprRate: number
  tokenType: LendingTokenType
  userVault: UserVault | undefined
}

type CreateLendToBorrowTokenTxnData = (
  params: CreateLendToBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateLendToBorrowTokenTxnDataParams>>

export const createLendToBorrowTokenTxnData: CreateLendToBorrowTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { instructions, signers } = await getIxnsAndSignersByLoanType(params, walletAndConnection)

  const accounts: web3.PublicKey[] = []
  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

const getIxnsAndSignersByLoanType = async (
  params: CreateLendToBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => {
  const { loan, aprRate, userVault } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan

  if (isTokenLoanListed(loan)) {
    const instructionsArray = []
    const signersArray = []

    if (userVault && !userVault.offerLiquidityAmount.isZero()) {
      const { instructions, signers } = await updateLiquidityToUserVault({
        connection: walletAndConnection.connection,
        args: {
          amount: BN.min(
            userVault.offerLiquidityAmount,
            calculateTokenLoanValueWithUpfrontFee(loan),
          ),
          lendingTokenType: bondTradeTransaction.lendingToken,
          add: false,
        },
        accounts: {
          userPubkey: walletAndConnection.wallet.publicKey,
        },
        sendTxn: sendTxnPlaceHolder,
      })

      instructionsArray.push(...instructions)
      signersArray.push(...signers)
    }

    const { instructions: lendToBorrowInstructions, signers: lendToBorrowSigners } =
      await lendToBorrowerListing({
        programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
        accounts: {
          hadoMarket: new web3.PublicKey(fraktBond.hadoMarket),
          protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
          borrower: new web3.PublicKey(loan.fraktBond.fbondIssuer),
          userPubkey: wallet.publicKey,
          bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
          oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
          fraktBond: new web3.PublicKey(fraktBond.publicKey),
        },
        args: {
          lendingTokenType: bondTradeTransaction.lendingToken,
        },
        connection,
        sendTxn: sendTxnPlaceHolder,
      })

    return {
      instructions: [...instructionsArray, ...lendToBorrowInstructions],
      signers: [...signersArray, ...lendToBorrowSigners],
    }
  }

  const instructionsArray = []
  const signersArray = []

  if (userVault && !userVault.offerLiquidityAmount.isZero()) {
    const { instructions, signers } = await updateLiquidityToUserVault({
      connection: walletAndConnection.connection,
      args: {
        amount: BN.min(userVault.offerLiquidityAmount, calculateTokenLoanValueWithUpfrontFee(loan)),
        lendingTokenType: bondTradeTransaction.lendingToken,
        add: false,
      },
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  const { instructions, signers } = await refinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey,
      hadoMarket: new web3.PublicKey(fraktBond.hadoMarket || ''),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      previousLender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    args: {
      lendingTokenType: bondTradeTransaction.lendingToken,
      newApr: new BN(aprRate),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  // if (isBanxSolTokenType(bondTradeTransaction.lendingToken) && !isTokenLoanListed(loan)) {
  //   const repayValue = calculateTokenLoanRepayValueOnCertainDate({
  //     loan,
  //     //? It is necessary to add some time because interest is accumulated even during the transaction processing.
  //     //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
  //     date: moment().unix() + 180,
  //   })

  //   return await banxSol.combineWithBuyBanxSolInstructions(
  //     {
  //       params,
  //       accounts: [],
  //       inputAmount: new BN(repayValue),
  //       instructions: [...vaultInstructions, ...instructions],
  //       signers: [...vaultSigners, ...signers],
  //       lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  //     },
  //     walletAndConnection,
  //   )
  // }

  return {
    instructions: [...instructionsArray, ...instructions],
    signers: [...signersArray, ...signers],
  }
}
