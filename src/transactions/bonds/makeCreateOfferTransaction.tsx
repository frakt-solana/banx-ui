import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  createPerpetualBondOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeCreatePerpetualOfferTransaction = (params: {
  marketPubkey: string
  loanValue: number
  loansAmount: number
  connection: web3.Connection
  wallet: WalletContextState
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
  accountsPublicKeys: {
    pairPubkey: web3.PublicKey
  }
  optimisticResult: BondOfferOptimistic
}>

export const makeCreatePerpetualOfferTransaction: MakeCreatePerpetualOfferTransaction = async ({
  marketPubkey,
  connection,
  loanValue,
  loansAmount,
  wallet,
}) => {
  const {
    instructions,
    signers,
    bondOfferV2: pairPubkey,
    optimisticResult,
  } = await createPerpetualBondOffer({
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    args: {
      loanValue: loanValue * 1e9,
      amountOfLoans: loansAmount,
    },
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    transaction: new web3.Transaction().add(...instructions),
    signers,
    accountsPublicKeys: { pairPubkey },
    optimisticResult,
  }
}
