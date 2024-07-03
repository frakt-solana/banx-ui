import { BN } from 'bn.js'
import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  createPerpetualListing,
  createPerpetualListingCnft,
  createPerpetualListingStakedBanx,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'
import {
  BondTradeTransactionV3,
  FraktBond,
  LendingTokenType,
} from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from '@banx/../../solana-txn-executor/src'
import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { fetchRuleset, parseBanxAccountInfo } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'
import { ListingType } from '../types'

export type CreateListTxnDataParams = {
  nft: core.BorrowNft
  aprRate: number
  loanValue: number
  freeze: number
  tokenType: LendingTokenType
}

type CreateListTxnData = (
  params: CreateListTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateListTxnDataParams>>

export const createListTxnData: CreateListTxnData = async (params, walletAndConnection) => {
  const { nft } = params

  const listingType = getNftListingType(nft)

  const { instructions, signers, optimisticResults } = await getIxnsAndSignersByListingType({
    params,
    type: listingType,
    walletAndConnection,
  })

  const accounts = [
    new web3.PublicKey(optimisticResults.fraktBond.publicKey),
    new web3.PublicKey(optimisticResults.bondTradeTransaction.publicKey),
  ]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

const getIxnsAndSignersByListingType = async ({
  params,
  type = ListingType.Default,
  walletAndConnection,
}: {
  params: CreateListTxnDataParams
  type?: ListingType
  walletAndConnection: WalletAndConnection
}) => {
  const { connection, wallet } = walletAndConnection

  const { nft, tokenType: lendingTokenType, loanValue, aprRate, freeze } = params

  if (type === ListingType.StakedBanx) {
    const ruleSet = await fetchRuleset({
      nftMint: nft.mint,
      connection,
      marketPubkey: nft.loan.marketPubkey,
    })

    const { instructions, signers, optimisticResults } = await createPerpetualListingStakedBanx({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        hadoMarket: new web3.PublicKey(nft.loan.marketPubkey),
        userPubkey: wallet.publicKey,
        nftMint: new web3.PublicKey(nft.mint),
        fraktMarket: new web3.PublicKey(nft.loan.fraktMarket),
        banxStake: new web3.PublicKey(nft.loan.banxStake || ''),
      },
      args: {
        amountToGetBorrower: new BN(loanValue),
        aprRate: new BN(aprRate),
        isBorrowerListing: true,
        lendingTokenType,
        terminationFreeze: new BN(freeze),
        upfrontFeeBasePoints: BONDS.PROTOCOL_FEE_PERCENT,
        ruleSet,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, optimisticResults }
  }

  if (type === ListingType.CNft) {
    if (!nft.nft.compression) {
      throw new Error(`Not cNFT`)
    }

    const proof = await getAssetProof(nft.mint, connection.rpcEndpoint)
    const ruleSet = await fetchRuleset({
      nftMint: nft.mint,
      connection,
      marketPubkey: nft.loan.marketPubkey,
    })

    const { instructions, signers, optimisticResults } = await createPerpetualListingCnft({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        hadoMarket: new web3.PublicKey(nft.loan.marketPubkey),
        userPubkey: wallet.publicKey,
        nftMint: new web3.PublicKey(nft.mint),
        fraktMarket: new web3.PublicKey(nft.loan.fraktMarket),
        tree: new web3.PublicKey(nft.nft.compression.tree),
        whitelistEntry: new web3.PublicKey(nft.nft.compression.whitelistEntry),
      },
      args: {
        amountToGetBorrower: new BN(loanValue),
        aprRate: new BN(aprRate),
        isBorrowerListing: true,
        lendingTokenType,
        terminationFreeze: new BN(freeze),
        upfrontFeeBasePoints: BONDS.PROTOCOL_FEE_PERCENT,
        ruleSet,
        cnftParams: nft.nft.compression,
        proof,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers, optimisticResults }
  }

  const ruleSet = await fetchRuleset({
    nftMint: nft.mint,
    connection,
    marketPubkey: nft.loan.marketPubkey,
  })

  const { instructions, signers, optimisticResults } = await createPerpetualListing({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      hadoMarket: new web3.PublicKey(nft.loan.marketPubkey),
      userPubkey: wallet.publicKey,
      nftMint: new web3.PublicKey(nft.mint),
      fraktMarket: new web3.PublicKey(nft.loan.fraktMarket),
    },
    args: {
      amountToGetBorrower: new BN(loanValue),
      aprRate: new BN(aprRate),
      isBorrowerListing: true,
      terminationFreeze: new BN(freeze),
      upfrontFeeBasePoints: BONDS.PROTOCOL_FEE_PERCENT,
      lendingTokenType,
      ruleSet,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, signers, optimisticResults }
}

export const getNftListingType = (nft: core.BorrowNft) => {
  if (nft.loan.banxStake && nft.loan.banxStake !== EMPTY_PUBKEY.toBase58()) {
    return ListingType.StakedBanx
  }

  if (nft.nft.compression) return ListingType.CNft

  return ListingType.Default
}

export const parseListNftSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = chain(accountInfoByPubkey)
    .toPairs()
    .filter(([, info]) => !!info)
    .map(([publicKey, info]) => {
      return parseBanxAccountInfo(new web3.PublicKey(publicKey), info)
    })
    .fromPairs()
    .value()

  return {
    bondTradeTransaction: results?.['bondTradeTransactionV3'] as BondTradeTransactionV3,
    fraktBond: results?.['fraktBond'] as FraktBond,
  }
}
