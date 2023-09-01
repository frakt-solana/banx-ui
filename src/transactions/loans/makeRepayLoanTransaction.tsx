import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  repayCnftPerpetualLoan,
  repayPerpetualLoan,
  repayStakedBanxPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'

export type MakeRepayLoanTransaction = (params: {
  connection: web3.Connection
  wallet: WalletContextState
  loans: Loan[]
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
}>

export const makeRepayLoanTransaction: MakeRepayLoanTransaction = async ({
  connection,
  wallet,
  loans,
}) => {
  // const repayAccounts = loans.map(({ fraktBond, bondTradeTransaction }) => ({
  //   bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
  //   lender: new web3.PublicKey(bondTradeTransaction.user),
  //   fbond: new web3.PublicKey(fraktBond.publicKey),
  //   collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
  //   optimistic: { fraktBond, bondTradeTransaction } as BondAndTransactionOptimistic,
  // }))

  const targetLoan = loans[0]
  if (targetLoan.fraktBond.banxStake !== EMPTY_PUBKEY.toBase58()) {
    const { instructions, signers } = await repayStakedBanxPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        userPubkey: wallet.publicKey as web3.PublicKey,
      },
      args: {
        repayAccounts: loans.map(({ fraktBond, bondTradeTransaction }) => ({
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
      transaction: new web3.Transaction().add(...instructions),
      signers,
    }
  } else if (targetLoan.nft.compression) {
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
        proof: await getAssetProof(
          targetLoan.nft.mint,
          connection.rpcEndpoint,
        ),
        cnftParams: targetLoan.nft.compression,
        optimistic: { fraktBond: targetLoan.fraktBond, bondTradeTransaction: targetLoan.bondTradeTransaction } as BondAndTransactionOptimistic,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      transaction: new web3.Transaction().add(...instructions),
      signers,
    }
  } else {
    const { instructions, signers } = await repayPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        userPubkey: wallet.publicKey as web3.PublicKey,
      },
      args: {
        repayAccounts: loans.map(({ fraktBond, bondTradeTransaction }) => ({
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
      transaction: new web3.Transaction().add(...instructions),
      signers,
    }
  }
}
