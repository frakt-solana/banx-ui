import { BN, web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  borrowCnftPerpetualCanopy,
  borrowPerpetual,
  borrowPerpetualCore,
  borrowStakedBanxPerpetual,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { TokenStandard } from '@banx/api'
import { helius } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { calculateApr, isBanxSolTokenType } from '@banx/utils'

import { fetchRuleset, parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'
import { BorrowType } from '../types'

export type CreateBorrowTxnDataParams = {
  nft: core.BorrowNft
  loanValue: number
  offer: core.Offer
  optimizeIntoReserves: boolean
  tokenType: LendingTokenType
}

export type CreateBorrowTxnData = (
  params: CreateBorrowTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateBorrowTxnDataParams>>

export const createBorrowTxnData: CreateBorrowTxnData = async (params, walletAndConnection) => {
  const { nft, loanValue, offer, optimizeIntoReserves, tokenType } = params

  const borrowType = getNftBorrowType(nft)

  const { instructions, signers, lookupTables, accountsCollection } = await getTxnDataByBorrowType({
    nft,
    loanValue,
    offer,
    optimizeIntoReserves,
    tokenType,
    borrowType,
    walletAndConnection,
  })

  const accounts = [
    accountsCollection['fraktBond'],
    accountsCollection['bondTradeTransaction'],
    accountsCollection['bondOffer'],
  ]

  if (isBanxSolTokenType(tokenType)) {
    return await banxSol.combineWithSellBanxSolInstructions(
      {
        params,
        accounts,
        //? 0.99 --> without upfront fee
        inputAmount: new BN(loanValue).mul(new BN(99)).div(new BN(100)),
        instructions,
        signers,
        lookupTables,
      },
      walletAndConnection,
    )
  }

  return {
    params,
    instructions,
    signers,
    accounts,
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

  if (borrowType === BorrowType.CoreNft) {
    if (!nft.nft.meta.collectionId) {
      throw new Error(`Not Core NFT`)
    }

    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await borrowPerpetualCore({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
        lender: new web3.PublicKey(offer.assetReceiver),
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        bondOffer: new web3.PublicKey(offer.publicKey),
        nftAsset: new web3.PublicKey(nft.nft.mint),
        hadoMarket: new web3.PublicKey(offer.hadoMarket),
        collection: new web3.PublicKey(nft.nft.meta.collectionId),
      },
      args: {
        amountToGet: new BN(loanValue),
        lendingTokenType: tokenType,
        aprRate: new BN(aprRate),
        optimizeIntoReserves,
      },
      connection: walletAndConnection.connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      accountsCollection,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  if (borrowType === BorrowType.StakedBanx) {
    if (!nft.loan.banxStake) {
      throw new Error(`Not BanxStaked NFT`)
    }

    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await borrowStakedBanxPerpetual({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),

      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      },
      args: {
        perpetualBorrowParamsAndAccounts: [
          {
            amountOfSolToGet: Math.floor(loanValue),
            lender: walletAndConnection.wallet.publicKey,
            tokenMint: new web3.PublicKey(nft.mint),
            bondOfferV2: new web3.PublicKey(offer.publicKey),
            hadoMarket: new web3.PublicKey(offer.hadoMarket),
            banxStake: new web3.PublicKey(nft.loan.banxStake || ''),
          },
        ],
        lendingTokenType: tokenType,
        optimizeIntoReserves,
        aprRate: new BN(aprRate),
      },
      connection: walletAndConnection.connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      accountsCollection,
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

    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await borrowCnftPerpetualCanopy({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),

      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
        lender: walletAndConnection.wallet.publicKey,
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
        amountOfSolToGet: new BN(loanValue),
        optimizeIntoReserves: optimizeIntoReserves,
        lendingTokenType: tokenType,
        aprRate: new BN(aprRate),
      },
      connection: walletAndConnection.connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      accountsCollection,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  const ruleSet = await fetchRuleset({
    nftMint: nft.mint,
    connection: walletAndConnection.connection,
    marketPubkey: nft.loan.marketPubkey,
  })

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await borrowPerpetual({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),

    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    },
    args: {
      perpetualBorrowParamsAndAccounts: [
        {
          amountOfSolToGet: new BN(Math.floor(loanValue)),
          lender: walletAndConnection.wallet.publicKey,
          ruleSet: ruleSet,
          tokenMint: new web3.PublicKey(nft.mint),
          bondOfferV2: new web3.PublicKey(offer.publicKey),
          hadoMarket: new web3.PublicKey(offer.hadoMarket),
        },
      ],
      lendingTokenType: tokenType,
      optimizeIntoReserves: optimizeIntoReserves,
      aprRate: new BN(aprRate),
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    accountsCollection,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

const getNftBorrowType = (nft: core.BorrowNft): BorrowType => {
  const isStakedBanx = !!nft.loan.banxStake && nft.loan.banxStake !== EMPTY_PUBKEY.toBase58()

  if (isStakedBanx) {
    return BorrowType.StakedBanx
  }

  if (nft.nft.compression) {
    return BorrowType.CNft
  }

  if (nft.nft.meta.tokenStandard === TokenStandard.CORE) {
    return BorrowType.CoreNft
  }

  return BorrowType.Default
}

export const parseBorrowSimulatedAccounts = (accountInfoByPubkey: SimulatedAccountInfoByPubkey) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondOffer: results?.['bondOfferV3']?.[0] as core.Offer,
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as core.BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as core.FraktBond,
  }
}
