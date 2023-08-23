import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { instantRefinancePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeInstantRefinanceTransaction = (params: {
  connection: web3.Connection
  wallet: WalletContextState
  loan: Loan
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
}>

export const makeInstantRefinanceTransaction: MakeInstantRefinanceTransaction = async ({
  connection,
  wallet,
  loan,
}) => {
  const { bondTradeTransaction, fraktBond } = loan || {}

  //? bondOffer => get biggest order by market. Check if less then repay

  const { instructions, signers } = await instantRefinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
      hadoMarket: new web3.PublicKey(fraktBond.publicKey),
      protocolFeeReceiver: new web3.PublicKey(fraktBond.fbondIssuer),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    optimistic: {
      oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.bondOffer),
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      fraktBond: new web3.PublicKey(fraktBond.publicKey),
      minMarketFee: new web3.PublicKey(fraktBond.publicKey),
    } as any,
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    transaction: new web3.Transaction().add(...instructions),
    signers,
  }
}
