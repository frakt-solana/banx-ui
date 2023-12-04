import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  claimCnftPerpetualLoan,
  claimPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'
import { MakeActionFn } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { fetchRuleset } from '../functions'

export type MakeClaimActionParams = {
  loan: Loan
}

export type MakeClaimAction = MakeActionFn<MakeClaimActionParams, BondAndTransactionOptimistic>

export const makeClaimAction: MakeClaimAction = async (ixnParams, { connection, wallet }) => {
  const { bondTradeTransaction, fraktBond } = ixnParams.loan || {}

  if (ixnParams.loan.nft.compression) {
    const { instructions, signers, optimisticResult } = await claimCnftPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      addComputeUnits: true,
      accounts: {
        fbond: new web3.PublicKey(fraktBond.publicKey),
        userPubkey: wallet.publicKey as web3.PublicKey,
        tree: new web3.PublicKey(ixnParams.loan.nft.compression.tree),
        bondTradeTransactionV2: new web3.PublicKey(bondTradeTransaction.publicKey),
        bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      },
      args: {
        proof: await getAssetProof(ixnParams.loan.nft.mint, connection.rpcEndpoint),
        cnftParams: ixnParams.loan.nft.compression,
        optimistic: {
          fraktBond,
          bondTradeTransaction,
        } as BondAndTransactionOptimistic,
      },

      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      additionalResult: optimisticResult,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  } else {
    const { instructions, signers, optimisticResult } = await claimPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      addComputeUnits: true,
      accounts: {
        fbond: new web3.PublicKey(fraktBond.publicKey),
        collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
        collateralOwner: new web3.PublicKey(fraktBond.fbondIssuer),
        bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        ruleSet: await fetchRuleset({
          nftMint: ixnParams.loan.nft.mint,
          connection,
          marketPubkey: fraktBond.hadoMarket,
        }),
        bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
        userPubkey: wallet.publicKey as web3.PublicKey,
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

    return {
      instructions,
      signers,
      additionalResult: optimisticResult,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }
}
