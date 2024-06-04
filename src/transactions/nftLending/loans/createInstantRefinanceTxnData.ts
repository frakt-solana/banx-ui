import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { instantRefinancePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { calculateClaimValue, isBanxSolTokenType } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateInstantRefinanceTxnData = (params: {
  loan: core.Loan
  bestOffer: core.Offer
  aprRate: number
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<core.Offer>>

export const createInstantRefinanceTxnData: CreateInstantRefinanceTxnData = async ({
  loan,
  bestOffer,
  aprRate,
  tokenType,
  walletAndConnection,
}) => {
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

  const result = optimisticResult.bondOffer

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  if (isBanxSolTokenType(tokenType)) {
    const claimValue = calculateClaimValue(loan)

    return await banxSol.combineWithSellBanxSolInstructions({
      inputAmount: new BN(claimValue),
      walletAndConnection,
      instructions,
      signers,
      lookupTables,
      result,
    })
  }

  return {
    instructions,
    signers,
    result,
    lookupTables,
  }
}
