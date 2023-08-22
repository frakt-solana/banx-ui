import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionAndOfferOptimistic,
  borrowPerpetual,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'

import { BorrowNft, Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeBorrowActionParams = {
  nft: BorrowNft
  loanValue: number
  offer: Offer
}[]

export type MakeBorrowAction = MakeActionFn<
  MakeBorrowActionParams,
  BondAndTransactionAndOfferOptimistic[]
>

export const LOANS_PER_TXN = 3

export const makeBorrowAction: MakeBorrowAction = async (ixnParams, { connection, wallet }) => {
  if (ixnParams.length > LOANS_PER_TXN)
    throw new Error(`Maximum borrow per txn is ${LOANS_PER_TXN}`)
  const { instructions, signers, optimisticResults } = await borrowPerpetual({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    },
    args: {
      perpetualBorrowParamsAndAccounts: ixnParams.map(({ nft, offer, loanValue }) => ({
        amountOfSolToGet: loanValue,
        minAmountToGet: loanValue,
        tokenMint: new web3.PublicKey(nft.mint),
        bondOfferV2: new web3.PublicKey(offer.publicKey),
        hadoMarket: new web3.PublicKey(offer.hadoMarket),
        optimistic: {
          fraktMarket: nft.loan.fraktMarket,
          minMarketFee: nft.loan.marketApr,
          bondOffer: offer as BondOfferV2,
        },
      })),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    additionalResult: optimisticResults,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
