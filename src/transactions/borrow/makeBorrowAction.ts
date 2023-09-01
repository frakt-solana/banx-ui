import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  borrowCnftPerpetual,
  borrowPerpetual,
  borrowStakedBanxPerpetual,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'

import { BorrowNft, Loan, Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeBorrowActionParams = {
  nft: BorrowNft
  loanValue: number
  offer: Offer
}[]

export type MakeBorrowActionResult = Loan[]

export type MakeBorrowAction = MakeActionFn<MakeBorrowActionParams, MakeBorrowActionResult>

export const LOANS_PER_TXN = 1

export const makeBorrowAction: MakeBorrowAction = async (ixnParams, { connection, wallet }) => {
  if (ixnParams.length > LOANS_PER_TXN)
    throw new Error(`Maximum borrow per txn is ${LOANS_PER_TXN}`)

  const targetParam = ixnParams[0]

  const { instructions, signers, optimisticResults } = targetParam.nft.loan.banxStake
    ? await borrowStakedBanxPerpetual({
        programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
        addComputeUnits: true,

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
            banxStake: new web3.PublicKey(nft.loan.banxStake || ''),
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
    : targetParam.nft.nft.compression
    ? await borrowCnftPerpetual({
        programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
        addComputeUnits: true,

        accounts: {
          userPubkey: wallet.publicKey as web3.PublicKey,
          protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
          nftMint: new web3.PublicKey(targetParam.nft.mint),
          bondOfferV2: new web3.PublicKey(targetParam.offer.publicKey),
          hadoMarket: new web3.PublicKey(targetParam.offer.hadoMarket),
          tree: new web3.PublicKey(targetParam.nft.nft.compression.tree),
        },
        args: {
          proof: await getAssetProof(targetParam.nft.mint, connection.rpcEndpoint),
          cnftParams: targetParam.nft.nft.compression,
          amountOfSolToGet: targetParam.loanValue,
          minAmountToGet: targetParam.loanValue,

          optimistic: {
            fraktMarket: targetParam.nft.loan.fraktMarket,
            minMarketFee: targetParam.nft.loan.marketApr,
            bondOffer: targetParam.offer as BondOfferV2,
          },
        },
        connection,
        sendTxn: sendTxnPlaceHolder,
      })
    : await borrowPerpetual({
        programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
        addComputeUnits: true,

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

  const loans: Loan[] = optimisticResults.map((optimistic, idx) => ({
    publicKey: optimistic.fraktBond.publicKey,
    fraktBond: optimistic.fraktBond,
    bondTradeTransaction: optimistic.bondTradeTransaction,
    nft: ixnParams[idx].nft.nft,
  }))

  return {
    instructions,
    signers,
    additionalResult: loans,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
