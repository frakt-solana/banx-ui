import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  borrowCnftPerpetual,
  borrowPerpetual,
  borrowStakedBanxPerpetual,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { first, uniq } from 'lodash'

import { BorrowNft, Loan, Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { WalletAndConnection } from '@banx/types'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'
import { BorrowType } from '../constants'

export type MakeBorrowActionParams = {
  nft: BorrowNft
  loanValue: number
  offer: Offer
}[]

export type MakeBorrowActionResult = { loan: Loan; offer: Offer }[]

export type MakeBorrowAction = MakeActionFn<MakeBorrowActionParams, MakeBorrowActionResult>

export const makeBorrowAction: MakeBorrowAction = async (ixnParams, walletAndConnection) => {
  const borrowType = getChunkBorrowType(ixnParams.map(({ nft }) => nft))

  if (ixnParams.length > BORROW_NFT_PER_TXN[borrowType]) {
    throw new Error(`Maximum borrow per txn is ${BORROW_NFT_PER_TXN[borrowType]}`)
  }

  const { instructions, signers, optimisticResults } = await getIxnsAndSignersByBorrowType({
    ixnParams,
    type: borrowType,
    walletAndConnection,
  })

  const loansAndOffers = optimisticResults.map((optimistic, idx) => {
    const loan = {
      publicKey: optimistic.fraktBond.publicKey,
      fraktBond: optimistic.fraktBond,
      bondTradeTransaction: optimistic.bondTradeTransaction,
      nft: ixnParams[idx].nft.nft,
    }

    return { loan, offer: optimistic.bondOffer }
  })

  return {
    instructions,
    signers,
    additionalResult: loansAndOffers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

const getIxnsAndSignersByBorrowType = async ({
  ixnParams,
  type = BorrowType.Default,
  walletAndConnection,
}: {
  ixnParams: MakeBorrowActionParams
  type?: BorrowType
  walletAndConnection: WalletAndConnection
}) => {
  const { connection, wallet } = walletAndConnection

  if (type === BorrowType.StakedBanx) {
    const params = ixnParams[0]
    if (!params.nft.loan.banxStake) {
      throw new Error(`Not BanxStaked NFT`)
    }
    const { instructions, signers, optimisticResults } = await borrowStakedBanxPerpetual({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      addComputeUnits: true,

      accounts: {
        userPubkey: wallet.publicKey as web3.PublicKey,
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      },
      args: {
        perpetualBorrowParamsAndAccounts: ixnParams.map(({ nft, offer, loanValue }) => ({
          amountOfSolToGet: loanValue,
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
    return { instructions, signers, optimisticResults }
  }

  if (type === BorrowType.CNft) {
    const params = ixnParams[0]
    if (!params.nft.nft.compression) {
      throw new Error(`Not cNFT`)
    }

    const proof = await getAssetProof(params.nft.mint, connection.rpcEndpoint)

    const { instructions, signers, optimisticResults } = await borrowCnftPerpetual({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      addComputeUnits: true,

      accounts: {
        userPubkey: wallet.publicKey as web3.PublicKey,
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        nftMint: new web3.PublicKey(params.nft.mint),
        bondOfferV2: new web3.PublicKey(params.offer.publicKey),
        hadoMarket: new web3.PublicKey(params.offer.hadoMarket),
        tree: new web3.PublicKey(params.nft.nft.compression.tree),
        whitelistEntry: new web3.PublicKey(params.nft.nft.compression.whitelistEntry),
      },
      args: {
        proof,
        cnftParams: params.nft.nft.compression,
        amountOfSolToGet: params.loanValue,

        optimistic: {
          fraktMarket: params.nft.loan.fraktMarket,
          minMarketFee: params.nft.loan.marketApr,
          bondOffer: params.offer as BondOfferV2,
        },
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, optimisticResults }
  }

  const { instructions, signers, optimisticResults } = await borrowPerpetual({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,

    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    },
    args: {
      perpetualBorrowParamsAndAccounts: ixnParams.map(({ nft, offer, loanValue }) => ({
        amountOfSolToGet: loanValue,
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

  return { instructions, signers, optimisticResults }
}

const getChunkBorrowType = (nfts: BorrowNft[]) => {
  const types = nfts.map((nft) => getNftBorrowType(nft))

  if (uniq(types).length > 1) {
    throw new Error('Nfts in chunk have different borrow type')
  }

  return first(types) ?? BorrowType.Default
}

export const getNftBorrowType = (nft: BorrowNft) => {
  if (nft.loan.banxStake && nft.loan.banxStake !== EMPTY_PUBKEY.toBase58())
    return BorrowType.StakedBanx
  if (nft.nft.compression) return BorrowType.CNft
  return BorrowType.Default
}

export const BORROW_NFT_PER_TXN = {
  [BorrowType.StakedBanx]: 1,
  [BorrowType.CNft]: 1,
  [BorrowType.Default]: 1,
}
