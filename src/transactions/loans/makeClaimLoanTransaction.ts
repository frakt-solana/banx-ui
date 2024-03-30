import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  claimCnftPerpetualLoanCanopy,
  claimPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { fetchRuleset } from '../functions'

export type MakeClaimActionParams = {
  loan: Loan
  priorityFees: number
}

export type MakeClaimAction = CreateTransactionDataFn<MakeClaimActionParams, Loan>

export const makeClaimAction: MakeClaimAction = async (ixnParams, { connection, wallet }) => {
  const { loan, priorityFees } = ixnParams
  const { bondTradeTransaction, fraktBond } = loan

  if (ixnParams.loan.nft.compression) {
    const { instructions, signers, optimisticResult } = await claimCnftPerpetualLoanCanopy({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      addComputeUnits: true,
      accounts: {
        bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        fbond: new web3.PublicKey(fraktBond.publicKey),
        userPubkey: wallet.publicKey as web3.PublicKey,
        tree: new web3.PublicKey(ixnParams.loan.nft.compression.tree),
        bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
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
      priorityFees,
    })

    const optimisticLoan = {
      ...loan,
      fraktBond: optimisticResult.fraktBond,
      bondTradeTransaction: optimisticResult.bondTradeTransaction,
    }

    return {
      instructions,
      signers,
      result: optimisticLoan,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  } else {
    const { instructions, signers, optimisticResult } = await claimPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      addComputeUnits: true,
      accounts: {
        bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        fbond: new web3.PublicKey(fraktBond.publicKey),
        collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
        collateralOwner: new web3.PublicKey(fraktBond.fbondIssuer),
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
      priorityFees,
    })

    const optimisticLoan = {
      ...loan,
      fraktBond: optimisticResult.fraktBond,
      bondTradeTransaction: optimisticResult.bondTradeTransaction,
    }

    return {
      instructions,
      signers,
      result: optimisticLoan,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }
}
