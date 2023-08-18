import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import {
  HadoMarketAndOfferOptimistic,
  borrowPerpetual,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeBorrowPerpetualTransaction = (params: {
  connection: web3.Connection
  wallet: WalletContextState
  mint: string
  loanValue: number
  offerPubkey: string
  marketPubkey: string
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
}>

export const makeBorrowPerpetualTransaction: MakeBorrowPerpetualTransaction = async ({
  connection,
  wallet,
  mint,
  loanValue,
  marketPubkey,
  offerPubkey,
}) => {
  const { instructions, signers } = await borrowPerpetual({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    },
    args: {
      perpetualBorrowParamsAndAccounts: [
        {
          amountOfSolToGet: loanValue,
          minAmountToGet: loanValue,
          tokenMint: new web3.PublicKey(mint),
          bondOfferV2: new web3.PublicKey(offerPubkey),
          hadoMarket: new web3.PublicKey(marketPubkey),
          optimistic: {} as HadoMarketAndOfferOptimistic,
        },
      ],
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    transaction: new web3.Transaction().add(...instructions),
    signers,
  }
}
