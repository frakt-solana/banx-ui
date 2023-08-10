import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { createPerpetualBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondFeatures } from 'fbonds-core/lib/fbond-protocol/types'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeCreatePerpetualOfferTransaction = (params: {
  amountOfSolToDeposit: number
  marketPubkey: string
  loanValueFilter: number
  bondFeature?: BondFeatures
  connection: web3.Connection
  wallet: WalletContextState
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
  accountsPublicKeys: {
    pairPubkey: web3.PublicKey
  }
}>

export const makeCreatePerpetualOfferTransaction: MakeCreatePerpetualOfferTransaction = async ({
  marketPubkey,
  bondFeature = BondFeatures.AutoreceiveSol,
  connection,
  loanValueFilter,
  amountOfSolToDeposit,
  wallet,
}) => {
  const {
    instructions,
    signers,
    bondOfferV2: pairPubkey,
  } = await createPerpetualBondOffer({
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    args: {
      amountOfSolToDeposit: amountOfSolToDeposit * 1e9,
      loanValueFilter: loanValueFilter * 1e9,
      bondFeatures: bondFeature,
    },
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    transaction: new web3.Transaction().add(...instructions),
    signers,
    accountsPublicKeys: { pairPubkey },
  }
}
