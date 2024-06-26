import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  claimPerpetualLoanv2,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { fetchRuleset } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

type CreateClaimTokenTxnData = (params: {
  loan: core.TokenLoan
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<core.TokenLoan>>

export const createClaimTokenTxnData: CreateClaimTokenTxnData = async ({
  loan,
  walletAndConnection,
}) => {
  const { wallet, connection } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, optimisticResult } = await claimPerpetualLoanv2({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
      collateralOwner: new web3.PublicKey(fraktBond.fbondIssuer),
      ruleSet: await fetchRuleset({
        nftMint: loan.collateral.mint,
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
