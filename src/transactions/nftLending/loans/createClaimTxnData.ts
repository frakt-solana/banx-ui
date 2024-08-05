import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  claimCnftPerpetualLoanCanopy,
  claimPerpetualLoanv2,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { helius } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { fetchRuleset, parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateClaimTxnDataParams = {
  loan: core.Loan
}

type CreateClaimTxnData = (
  params: CreateClaimTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateClaimTxnDataParams>>

export const createClaimTxnData: CreateClaimTxnData = async (params, walletAndConnection) => {
  const { loan } = params
  const { wallet, connection } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  if (loan.nft.compression) {
    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await claimCnftPerpetualLoanCanopy({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        fbond: new web3.PublicKey(fraktBond.publicKey),
        userPubkey: wallet.publicKey,
        tree: new web3.PublicKey(loan.nft.compression.tree),
        bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      },
      args: {
        proof: await helius.getHeliusAssetProof({ assetId: loan.nft.mint, connection }),
        cnftParams: loan.nft.compression,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    const accounts = [accountsCollection['fraktBond'], accountsCollection['bondTradeTransaction']]

    return {
      params,
      accounts,
      instructions,
      signers,
      lookupTables,
    }
  } else {
    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await claimPerpetualLoanv2({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        fbond: new web3.PublicKey(fraktBond.publicKey),
        collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
        collateralOwner: new web3.PublicKey(fraktBond.fbondIssuer),
        ruleSet: await fetchRuleset({
          nftMint: loan.nft.mint,
          connection,
          marketPubkey: fraktBond.hadoMarket,
        }),
        bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
        userPubkey: wallet.publicKey,
        banxStake: new web3.PublicKey(
          fraktBond.banxStake !== EMPTY_PUBKEY.toBase58()
            ? fraktBond.banxStake
            : fraktBond.fraktMarket,
        ),
        subscriptionsAndAdventures: [],
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    const accounts = [accountsCollection['fraktBond'], accountsCollection['bondTradeTransaction']]

    return {
      params,
      accounts,
      instructions,
      signers,
      lookupTables,
    }
  }
}

export const parseClaimNftSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondTradeTransaction: results?.['bondTradeTransactionV3'] as core.BondTradeTransaction,
    fraktBond: results?.['fraktBond'] as core.FraktBond,
  }
}
