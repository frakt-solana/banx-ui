import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  claimCnftPerpetualLoanCanopy,
  claimPerpetualLoanv2,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { helius } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { fetchRuleset } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

type CreateClaimTxnData = (params: {
  loan: core.Loan
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<core.Loan>>

export const createClaimTxnData: CreateClaimTxnData = async ({ loan, walletAndConnection }) => {
  const { wallet, connection } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

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
