import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  removePerpetualListing,
  removePerpetualListingCnft,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'
import moment from 'moment'
import { CreateTransactionDataFn, WalletAndConnection } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { PriorityLevel, mergeWithComputeUnits } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

import { ListingType } from '../constants'
import { fetchRuleset } from '../functions'

export type MakeDelistActionParams = {
  loan: Loan
  priorityFeeLevel: PriorityLevel
}

export type MakeDelistAction = CreateTransactionDataFn<MakeDelistActionParams, Loan>

export const makeDelistAction: MakeDelistAction = async (ixnParams, walletAndConnection) => {
  const { loan, priorityFeeLevel } = ixnParams

  const listingType = getNftListingType(loan)

  const { instructions: listingInstructions, signers } = await getIxnsAndSignersByListingType({
    ixnParams,
    type: listingType,
    walletAndConnection,
  })

  const instructions = await mergeWithComputeUnits({
    instructions: listingInstructions,
    connection: walletAndConnection.connection,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    payer: walletAndConnection.wallet.publicKey,
    priorityLevel: priorityFeeLevel,
  })

  const optimisticLoan = {
    ...loan,
    bondTradeTransaction: {
      ...loan.bondTradeTransaction,
      terminationFreeze: 0, //? Set 0 to filter loan from list
    },
    fraktBond: {
      ...loan.fraktBond,
      lastTransactedAt: moment().unix(), //? Needs to prevent BE data overlap in optimistics logic
    },
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
  ixnParams: MakeDelistActionParams
  type?: ListingType
  walletAndConnection: WalletAndConnection
}) => {
  const { connection, wallet } = walletAndConnection
  const { loan } = ixnParams

  if (type === ListingType.CNft) {
    if (!loan.nft.compression) {
      throw new Error(`Not cNFT`)
    }

    const proof = await getAssetProof(loan.nft.mint, connection.rpcEndpoint)
    const ruleSet = await fetchRuleset({
      nftMint: loan.nft.mint,
      connection,
      marketPubkey: loan.fraktBond.hadoMarket,
    })

    const { instructions, signers } = await removePerpetualListingCnft({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        hadoMarket: new web3.PublicKey(loan.fraktBond.hadoMarket || ''),
        fraktMarket: new web3.PublicKey(loan.fraktBond.fraktMarket),
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        borrower: new web3.PublicKey(loan.fraktBond.fbondIssuer),
        userPubkey: wallet.publicKey,
        nftMint: new web3.PublicKey(loan.nft.mint),
        bondOffer: new web3.PublicKey(loan.bondTradeTransaction.bondOffer),
        oldBondTradeTransaction: new web3.PublicKey(loan.bondTradeTransaction.publicKey),
        fraktBond: new web3.PublicKey(loan.fraktBond.publicKey),
        tree: new web3.PublicKey(loan.nft.compression.tree),
      },
      args: {
        isBorrowerListing: true,
        ruleSet,
        cnftParams: loan.nft.compression,
        proof,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return { instructions, signers }
  }

  const ruleSet = await fetchRuleset({
    nftMint: loan.nft.mint,
    connection,
    marketPubkey: loan.fraktBond.hadoMarket,
  })

  const { instructions, signers } = await removePerpetualListing({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      hadoMarket: new web3.PublicKey(loan.fraktBond.hadoMarket || ''),
      fraktMarket: new web3.PublicKey(loan.fraktBond.fraktMarket),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      borrower: new web3.PublicKey(loan.fraktBond.fbondIssuer),
      userPubkey: wallet.publicKey,
      bondOffer: new web3.PublicKey(loan.bondTradeTransaction.bondOffer),
      oldBondTradeTransaction: new web3.PublicKey(loan.bondTradeTransaction.publicKey),
      fraktBond: new web3.PublicKey(loan.fraktBond.publicKey),
      nftMint: new web3.PublicKey(loan.nft.mint),
    },
    args: {
      isBorrowerListing: true,
      ruleSet,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, signers }
}

const getNftListingType = (loan: Loan) => {
  if (loan.nft.compression) return ListingType.CNft
  return ListingType.Default
}
