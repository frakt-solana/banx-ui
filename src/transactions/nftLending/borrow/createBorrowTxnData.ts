import { BN, web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  borrowCnftPerpetualCanopy,
  borrowPerpetual,
  borrowStakedBanxPerpetual,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { helius } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { calculateApr, isBanxSolTokenType } from '@banx/utils'

import { fetchRuleset } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'
import { BorrowType } from '../types'

export type BorrowTxnOptimisticResult = { loan: core.Loan; offer: core.Offer }

export type CreateBorrowTxnDataParams = {
  nft: core.BorrowNft
  loanValue: number
  offer: core.Offer
  optimizeIntoReserves: boolean
  tokenType: LendingTokenType
}

export type CreateBorrowTxnData = (
  params: CreateBorrowTxnDataParams & { walletAndConnection: WalletAndConnection },
) => Promise<CreateTxnData<BorrowTxnOptimisticResult>>

export const createBorrowTxnData: CreateBorrowTxnData = async ({
  nft,
  loanValue,
  offer,
  optimizeIntoReserves,
  tokenType,
  walletAndConnection,
}) => {
  const borrowType = getNftBorrowType(nft)

  const { instructions, signers, lookupTables, optimisticResult } = await getTxnDataByBorrowType({
    nft,
    loanValue,
    offer,
    optimizeIntoReserves,
    tokenType,
    borrowType,
    walletAndConnection,
  })

  const loanAndOffer = {
    loan: {
      publicKey: optimisticResult.fraktBond.publicKey,
      fraktBond: optimisticResult.fraktBond,
      bondTradeTransaction: optimisticResult.bondTradeTransaction,
      nft: nft.nft,
    },
    offer: optimisticResult.bondOffer,
  }

  if (isBanxSolTokenType(tokenType)) {
    return await banxSol.combineWithSellBanxSolInstructions({
      //? 0.99 --> without upfront fee
      inputAmount: new BN(loanValue).mul(new BN(99)).div(new BN(100)),
      walletAndConnection,
      instructions,
      signers,
      lookupTables,
      result: loanAndOffer,
    })
  }

  return {
    instructions,
    signers,
    result: loanAndOffer,
    lookupTables,
  }
}

const getTxnDataByBorrowType = async ({
  loanValue,
  nft,
  offer,
  tokenType,
  optimizeIntoReserves,
  borrowType,
  walletAndConnection,
}: CreateBorrowTxnDataParams & {
  borrowType: BorrowType
  walletAndConnection: WalletAndConnection
}) => {
  const aprRate = calculateApr({
    loanValue: loanValue,
    collectionFloor: nft.nft.collectionFloor,
    marketPubkey: nft.loan.marketPubkey,
  })

  if (borrowType === BorrowType.StakedBanx) {
    if (!nft.loan.banxStake) {
      throw new Error(`Not BanxStaked NFT`)
    }

    const { instructions, signers, optimisticResults } = await borrowStakedBanxPerpetual({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),

      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      },
      args: {
        perpetualBorrowParamsAndAccounts: [
          {
            amountOfSolToGet: Math.floor(loanValue),
            tokenMint: new web3.PublicKey(nft.mint),
            bondOfferV2: new web3.PublicKey(offer.publicKey),
            hadoMarket: new web3.PublicKey(offer.hadoMarket),
            banxStake: new web3.PublicKey(nft.loan.banxStake || ''),
            optimistic: {
              fraktMarket: nft.loan.fraktMarket,
              minMarketFee: nft.loan.marketApr,
              bondOffer: offer as BondOfferV2,
            },
          },
        ],
        lendingTokenType: tokenType,
        optimizeIntoReserves,
        aprRate,
      },
      connection: walletAndConnection.connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      optimisticResult: optimisticResults[0],
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  if (borrowType === BorrowType.CNft) {
    if (!nft.nft.compression) {
      throw new Error(`Not cNFT`)
    }

    const proof = await helius.getHeliusAssetProof({
      assetId: nft.mint,
      connection: walletAndConnection.connection,
    })

    const { instructions, signers, optimisticResults } = await borrowCnftPerpetualCanopy({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),

      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        nftMint: new web3.PublicKey(nft.mint),
        bondOfferV2: new web3.PublicKey(offer.publicKey),
        hadoMarket: new web3.PublicKey(offer.hadoMarket),
        tree: new web3.PublicKey(nft.nft.compression.tree),
        whitelistEntry: new web3.PublicKey(nft.nft.compression.whitelistEntry),
      },
      args: {
        proof,
        cnftParams: nft.nft.compression,
        amountOfSolToGet: loanValue,

        optimistic: {
          fraktMarket: nft.loan.fraktMarket,
          minMarketFee: nft.loan.marketApr,
          bondOffer: offer as BondOfferV2,
        },
        optimizeIntoReserves: optimizeIntoReserves,
        lendingTokenType: tokenType,
        aprRate,
      },
      connection: walletAndConnection.connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      optimisticResult: optimisticResults[0],
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  const ruleSet = await fetchRuleset({
    nftMint: nft.mint,
    connection: walletAndConnection.connection,
    marketPubkey: nft.loan.marketPubkey,
  })

  const { instructions, signers, optimisticResults } = await borrowPerpetual({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),

    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    },
    args: {
      perpetualBorrowParamsAndAccounts: [
        {
          amountOfSolToGet: Math.floor(loanValue),
          ruleSet: ruleSet,
          tokenMint: new web3.PublicKey(nft.mint),
          bondOfferV2: new web3.PublicKey(offer.publicKey),
          hadoMarket: new web3.PublicKey(offer.hadoMarket),
          optimistic: {
            fraktMarket: nft.loan.fraktMarket,
            minMarketFee: nft.loan.marketApr,
            bondOffer: offer as BondOfferV2,
          },
        },
      ],
      lendingTokenType: tokenType,
      optimizeIntoReserves: optimizeIntoReserves,
      aprRate,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    optimisticResult: optimisticResults[0],
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

const getNftBorrowType = (nft: core.BorrowNft): BorrowType => {
  if (nft.loan.banxStake && nft.loan.banxStake !== EMPTY_PUBKEY.toBase58())
    return BorrowType.StakedBanx
  if (nft.nft.compression) return BorrowType.CNft
  return BorrowType.Default
}
