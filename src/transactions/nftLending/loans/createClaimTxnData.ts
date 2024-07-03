import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  claimCnftPerpetualLoanCanopy,
  claimPerpetualLoanv2,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondTradeTransactionV3, FraktBond } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { helius } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { fetchRuleset, parseBanxAccountInfo } from '../../functions'
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
    const { instructions, signers, optimisticResult } = await claimCnftPerpetualLoanCanopy({
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
        optimistic: {
          fraktBond,
          bondTradeTransaction,
        } as BondAndTransactionOptimistic,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    const accounts = [
      new web3.PublicKey(optimisticResult.fraktBond.publicKey),
      new web3.PublicKey(optimisticResult.bondTradeTransaction.publicKey),
    ]

    return {
      params,
      accounts,
      instructions,
      signers,
      lookupTables,
    }
  } else {
    const { instructions, signers, optimisticResult } = await claimPerpetualLoanv2({
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
      optimistic: {
        fraktBond,
        bondTradeTransaction,
      } as BondAndTransactionOptimistic,
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    const accounts = [
      new web3.PublicKey(optimisticResult.fraktBond.publicKey),
      new web3.PublicKey(optimisticResult.bondTradeTransaction.publicKey),
    ]

    return {
      params,
      accounts,
      instructions,
      signers,
      lookupTables,
    }
  }
}

//TODO Move results logic into shared separate function?
export const parseClaimNftSimulatedAccounts = (
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
