import { BN } from 'bn.js'
import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  createPerpetualListing,
  createPerpetualListingCnft,
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

export const createListTxnData: CreateListTxnData = async (ixnParams) => {
  const { nft, walletAndConnection } = ixnParams

  const listingType = getNftListingType(nft)

  const { instructions, signers, optimisticResults } = await getIxnsAndSignersByListingType({
    ixnParams,
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
  ixnParams,
  type = ListingType.Default,
  walletAndConnection,
}: {
  ixnParams: CreateListTxnDataParams
  type?: ListingType
  walletAndConnection: WalletAndConnection
}) => {
  const { connection, wallet } = walletAndConnection

  const { nft, tokenType: lendingTokenType, loanValue, aprRate, freeze } = ixnParams

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
        amountToGet: new BN(loanValue),
        aprRate: new BN(aprRate),
        isBorrowerListing: true,
        lendingTokenType,
        terminationFreeze: new BN(freeze),
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
      amountToGet: new BN(loanValue),
      aprRate: new BN(aprRate),
      isBorrowerListing: true,
      terminationFreeze: new BN(freeze),
      lendingTokenType,
      ruleSet,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, signers, optimisticResults }
}

export const getNftListingType = (nft: BorrowNft) => {
  if (nft.nft.compression) return ListingType.CNft
  return ListingType.Default
}
