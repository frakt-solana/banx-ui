import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { instantRefinancePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateInstantRefinanceTokenTxnData = (params: {
  loan: core.TokenLoan
  bestOffer: Offer
  aprRate: number
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<Offer>>

export const createInstantRefinanceTokenTxnData: CreateInstantRefinanceTokenTxnData = async ({
  loan,
  bestOffer,
  aprRate,
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
      fraktBond,
      oldBondOffer: getMockBondOffer(),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    result: optimisticResult.bondOffer,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
