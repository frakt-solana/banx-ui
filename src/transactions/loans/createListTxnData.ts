import { BN } from 'bn.js'
import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  createPerpetualListing,
  createPerpetualListingCnft,
  createPerpetualListingStakedBanx,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BorrowNft, Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { ListingType } from '../constants'
import { fetchRuleset } from '../functions'

type CreateListTxnDataParams = {
  nft: BorrowNft
  aprRate: number
  loanValue: number
  freeze: number
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}

type CreateListTxnData = (params: CreateListTxnDataParams) => Promise<CreateTxnData<Loan>>

export const createListTxnData: CreateListTxnData = async (params) => {
  const { nft, walletAndConnection } = params

  const listingType = getNftListingType(nft)

  const { instructions, signers, optimisticResults } = await getIxnsAndSignersByListingType({
    params,
    type: listingType,
    walletAndConnection,
  })

  const optimisticLoan = {
    publicKey: optimisticResults.fraktBond.publicKey,
    fraktBond: optimisticResults.fraktBond,
    bondTradeTransaction: optimisticResults.bondTradeTransaction,
    nft: nft.nft,
  }

  return {
    instructions,
    signers,
    result: optimisticLoan,
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
    if (!nft.loan.banxStake) {
      throw new Error(`Not BanxStaked NFT`)
    }

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
        banxStake: new web3.PublicKey(nft.loan.banxStake),
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

export const getNftListingType = (nft: BorrowNft) => {
  if (nft.loan.banxStake && nft.loan.banxStake !== EMPTY_PUBKEY.toBase58()) {
    return ListingType.StakedBanx
  }

  if (nft.nft.compression) return ListingType.CNft

  return ListingType.Default
}
