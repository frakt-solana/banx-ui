import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  repayCnftPerpetualLoan,
  repayPerpetualLoan,
  repayStakedBanxPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'

import { Loan } from '@banx/api/core'
import { BANX_STAKING, BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeRepayLoansActionParams = Loan[]

export type MakeRepayLoansAction = MakeActionFn<MakeRepayLoansActionParams, undefined>

export const LOANS_PER_TXN = 1

export const makeRepayLoansAction: MakeRepayLoansAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const targetLoan = ixnParams[0]

  if (targetLoan.nft.compression) {
    const { instructions, signers } = await repayCnftPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        userPubkey: wallet.publicKey as web3.PublicKey,
        bondTradeTransactionV2: new web3.PublicKey(targetLoan.bondTradeTransaction.publicKey),
        lender: new web3.PublicKey(targetLoan.bondTradeTransaction.user),
        fbond: new web3.PublicKey(targetLoan.fraktBond.publicKey),
        tree: new web3.PublicKey(targetLoan.nft.compression.tree),
      },
      args: {
        proof: await getAssetProof(targetLoan.nft.mint, connection.rpcEndpoint),
        cnftParams: targetLoan.nft.compression,
        optimistic: {
          fraktBond: targetLoan.fraktBond,
          bondTradeTransaction: targetLoan.bondTradeTransaction,
        } as BondAndTransactionOptimistic,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      lookupTables: [],
    }
  } else if (
    targetLoan.fraktBond.banxStake !== EMPTY_PUBKEY.toBase58() &&
    targetLoan.fraktBond.fraktMarket === BANX_STAKING.FRAKT_MARKET
  ) {
    const { instructions, signers } = await repayStakedBanxPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        userPubkey: wallet.publicKey as web3.PublicKey,
      },
      args: {
        repayAccounts: ixnParams.map(({ fraktBond, bondTradeTransaction }) => ({
          bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
          lender: new web3.PublicKey(bondTradeTransaction.user),
          fbond: new web3.PublicKey(fraktBond.publicKey),
          banxStake: new web3.PublicKey(fraktBond.banxStake),
          optimistic: { fraktBond, bondTradeTransaction } as BondAndTransactionOptimistic,
        })),
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      lookupTables: [],
    }
  } else {
    const { instructions, signers } = await repayPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        userPubkey: wallet.publicKey as web3.PublicKey,
      },
      args: {
        repayAccounts: ixnParams.map(({ fraktBond, bondTradeTransaction }) => ({
          bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
          lender: new web3.PublicKey(bondTradeTransaction.user),
          fbond: new web3.PublicKey(fraktBond.publicKey),
          collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
          optimistic: { fraktBond, bondTradeTransaction } as BondAndTransactionOptimistic,
        })),
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      lookupTables: [],
    }
  }
}
